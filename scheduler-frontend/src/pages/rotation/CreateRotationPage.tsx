import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    FormControlLabel,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { UsersAPI, RotationAPI } from "../../api";
import ScopeSelector from "./components/ScopeSelector";
import type { User } from "../../types/user";

const ROTATION_TYPES = ["TEAM", "SUBTEAM", "ROLE", "DOMAIN", "DOMAIN_TEAM", "CROSS_TEAM"] as const;
const CADENCE_TYPES = ["DAILY", "WEEKLY", "BIWEEKLY", "CUSTOM"] as const;

type RotationType = (typeof ROTATION_TYPES)[number];
type RotationCadence = (typeof CADENCE_TYPES)[number];
type RotationScope =
    | "TEAM"
    | "SUBTEAM"
    | "GROUP"
    | "ROLE"
    | "DOMAIN"
    | "DOMAIN_TEAM"
    | "NONE";

//  Rotation Type → Allowed Scope Types
const ALLOWED_SCOPE_TYPES: Record<RotationType, RotationScope[]> = {
    TEAM: ["TEAM"],
    SUBTEAM: ["SUBTEAM"],
    ROLE: ["ROLE"],
    DOMAIN: ["DOMAIN"],
    DOMAIN_TEAM: ["DOMAIN_TEAM"],
    CROSS_TEAM: ["GROUP", "DOMAIN"], // cross-team rotations
    // NONE is a special/global scope that can be used with any rotation type
};

interface CreateRotationForm {
    name: string;
    code?: string;
    type: RotationType;
    cadence: RotationCadence;
    cadence_interval?: number;
    priority: number;
    allow_overlap: boolean;
    min_assignees: number;
    max_assignees: number;
    scope_type: RotationScope;
    scope_ref_id?: string | null;
    owner_id?: string | null;
    description?: string | null;
    is_active: boolean;

    start_date: string;
    end_date?: string | null;
    effective_date: string;
    freeze_date?: string | null;
}

function generateRotationCode(name: string, type: string, cadence: string) {
    const slug = name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
    return `${type}_${cadence}_${slug}`.substring(0, 40);
}

function getDefaultsByType(type: RotationType): {
    scope_type: RotationScope;
    cadence: RotationCadence;
    min_assignees: number;
    max_assignees: number;
    allow_overlap: boolean;
    priority: number;
} {
    switch (type) {
        case "TEAM":
            return { scope_type: "TEAM", cadence: "WEEKLY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 100 };
        case "SUBTEAM":
            return { scope_type: "SUBTEAM", cadence: "WEEKLY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 100 };
        case "ROLE":
            return { scope_type: "ROLE", cadence: "WEEKLY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 50 };
        case "DOMAIN":
            return { scope_type: "DOMAIN", cadence: "DAILY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 100 };
        case "DOMAIN_TEAM":
            return { scope_type: "DOMAIN_TEAM", cadence: "DAILY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 100 };
        case "CROSS_TEAM":
            return { scope_type: "GROUP", cadence: "WEEKLY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 80 };
        default:
            return { scope_type: "NONE", cadence: "WEEKLY", min_assignees: 1, max_assignees: 1, allow_overlap: false, priority: 100 };
    }
}

export default function CreateRotationPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);

    const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateRotationForm>({
        defaultValues: {
            type: "TEAM",
            cadence: "WEEKLY",
            cadence_interval: 1,
            priority: 100,
            allow_overlap: false,
            min_assignees: 1,
            max_assignees: 1,
            scope_type: "TEAM",
            is_active: true,
            start_date: today,
            effective_date: today,
        },
    });

    const type = watch("type");
    const cadence = watch("cadence");
    const scopeType = watch("scope_type");

    // When rotation type changes → reset defaults + clear scope_ref_id
    useEffect(() => {
        const defaults = getDefaultsByType(type);

        setValue("scope_type", defaults.scope_type);
        setValue("cadence", defaults.cadence);
        setValue("min_assignees", defaults.min_assignees);
        setValue("max_assignees", defaults.max_assignees);
        setValue("allow_overlap", defaults.allow_overlap);
        setValue("priority", defaults.priority);

        setValue("scope_ref_id", null);
    }, [type, setValue]);

    // When scope type changes → clear scope_ref_id
    useEffect(() => {
        setValue("scope_ref_id", null);
    }, [scopeType, setValue]);

    useEffect(() => {
        UsersAPI.getAll().then(setUsers);
    }, []);

    const onSubmit = async (data: CreateRotationForm) => {
        // Validate scope type
        if (!ALLOWED_SCOPE_TYPES[data.type].includes(data.scope_type) && data.scope_type !== "NONE") {
            alert("Invalid scope type for this rotation type.");
            return;
        }

        // Validate scope_ref_id
        if (data.scope_type !== "NONE" && !data.scope_ref_id) {
            alert("Please select a scope target.");
            return;
        }

        const code = generateRotationCode(data.name, data.type, data.cadence);

        const payload = {
            name: data.name,
            code,
            type: data.type,
            cadence: data.cadence,
            cadence_interval: data.cadence === "CUSTOM" ? data.cadence_interval ?? 1 : 1,
            priority: data.priority,
            allow_overlap: data.allow_overlap,
            min_assignees: data.min_assignees,
            max_assignees: data.max_assignees,
            scope_type: data.scope_type,
            scope_ref_id: data.scope_ref_id || null,
            owner_id: data.owner_id || null,
            description: data.description || null,
            is_active: data.is_active,

            start_date: new Date(data.start_date).toISOString(),
            end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
            effective_date: new Date(data.effective_date).toISOString(),
            freeze_date: data.freeze_date ? new Date(data.freeze_date).toISOString() : null,
        };

        const created = await RotationAPI.create(payload);
        navigate(`/rotations/${created.id}/members`);
    };

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Create Rotation
            </Typography>

            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>

                        {/* Name */}
                        <TextField
                            label="Name"
                            fullWidth
                            {...register("name", { required: "Name is required" })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />

                        {/* Rotation Type */}
                        <TextField
                            select
                            label="Rotation Type"
                            fullWidth
                            {...register("type", { required: "Type is required" })}
                            error={!!errors.type}
                            helperText={errors.type?.message}
                        >
                            {ROTATION_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Cadence */}
                        <TextField
                            select
                            label="Cadence"
                            fullWidth
                            {...register("cadence", { required: "Cadence is required" })}
                            error={!!errors.cadence}
                            helperText={errors.cadence?.message}
                        >
                            {CADENCE_TYPES.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Cadence Interval */}
                        {cadence === "CUSTOM" && (
                            <TextField
                                label="Cadence Interval (days)"
                                type="number"
                                fullWidth
                                {...register("cadence_interval", {
                                    required: "Interval is required for CUSTOM cadence",
                                    min: { value: 1, message: "Must be >= 1" },
                                })}
                                error={!!errors.cadence_interval}
                                helperText={errors.cadence_interval?.message}
                            />
                        )}

                        {/* Priority */}
                        <TextField
                            label="Priority"
                            type="number"
                            fullWidth
                            {...register("priority", {
                                required: "Priority is required",
                                min: { value: 1, message: "Must be >= 1" },
                            })}
                            error={!!errors.priority}
                            helperText={errors.priority?.message}
                        />

                        {/* Min Assignees */}
                        <TextField
                            label="Minimum Assignees"
                            type="number"
                            fullWidth
                            {...register("min_assignees", {
                                required: "Minimum assignees required",
                                min: { value: 1, message: "Must be >= 1" },
                            })}
                            error={!!errors.min_assignees}
                            helperText={errors.min_assignees?.message}
                        />

                        {/* Max Assignees */}
                        <TextField
                            label="Maximum Assignees"
                            type="number"
                            fullWidth
                            {...register("max_assignees", {
                                required: "Maximum assignees required",
                                min: { value: 1, message: "Must be >= 1" },
                                validate: (value, form) =>
                                    value >= form.min_assignees || "Max must be >= Min",
                            })}
                            error={!!errors.max_assignees}
                            helperText={errors.max_assignees?.message}
                        />

                        {/* Allow Overlap */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={watch("allow_overlap")}
                                    onChange={(e) => setValue("allow_overlap", e.target.checked)}
                                />
                            }
                            label="Allow Overlapping Assignments"
                        />

                        {/* Scope Type */}
                        <TextField
                            select
                            label="Scope Type"
                            fullWidth
                            {...register("scope_type", { required: "Scope type is required" })}
                            error={!!errors.scope_type}
                            helperText={errors.scope_type?.message}
                        >
                            {/* Normal allowed scope types */}
                            {ALLOWED_SCOPE_TYPES[type].map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}

                            {/* Special / Global
                            <MenuItem disabled>──────── Special / Global ────────</MenuItem>
                            <MenuItem value="NONE">NONE (Special / Global Pool)</MenuItem> */}
                        </TextField>

                        {/* Scope Selector */}
                        <ScopeSelector
                            scopeType={scopeType}
                            value={watch("scope_ref_id") ?? null}
                            onChange={(v) => setValue("scope_ref_id", v ?? null)}
                        />

                        {/* Rotation Owner */}
                        <TextField select label="Rotation Owner" fullWidth {...register("owner_id")}>
                            <MenuItem value="">(None)</MenuItem>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.email})
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Dates */}
                        <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register("start_date", { required: "Start date is required" })}
                            error={!!errors.start_date}
                            helperText={errors.start_date?.message}
                        />

                        <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register("end_date")}
                            error={!!errors.end_date}
                            helperText={errors.end_date?.message}
                        />

                        <TextField
                            label="Effective Date"
                            type="date"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register("effective_date", { required: "Effective date is required" })}
                            error={!!errors.effective_date}
                            helperText={errors.effective_date?.message}
                        />

                        <TextField
                            label="Freeze Date"
                            type="date"
                            fullWidth
                            slotProps={{ inputLabel: { shrink: true } }}
                            {...register("freeze_date")}
                            error={!!errors.freeze_date}
                            helperText={errors.freeze_date?.message}
                        />

                        {/* Description */}
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            {...register("description")}
                        />

                        {/* Active */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={watch("is_active")}
                                    onChange={(e) => setValue("is_active", e.target.checked)}
                                />
                            }
                            label="Active Rotation"
                        />

                        {/* Submit */}
                        <Box display="flex" justifyContent="flex-end">
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                Create
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}