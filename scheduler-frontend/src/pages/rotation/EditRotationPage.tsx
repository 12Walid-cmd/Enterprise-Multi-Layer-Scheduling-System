import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { RotationAPI, UsersAPI } from "../../api";
import type { RotationDefinition } from "../../types/rotation";
import ScopeSelector from "./components/ScopeSelector";

const ROTATION_TYPES = ["TEAM", "SUBTEAM", "ROLE", "DOMAIN", "CROSS_TEAM"] as const;
const CADENCE_TYPES = ["DAILY", "WEEKLY", "BIWEEKLY", "CUSTOM"] as const;
const SCOPE_TYPES = ["TEAM", "SUBTEAM", "GROUP", "ROLE", "DOMAIN", "NONE"] as const;

interface EditRotationForm {
    name: string;
    code: string;
    type: string;
    cadence: string;
    cadence_interval?: number;
    allow_overlap: boolean;
    min_assignees: number;
    scope_type: string;
    scope_ref_id?: string | null;
    owner_id?: string | null;
    description?: string | null;
    is_active: boolean;
}

export default function EditRotationPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [rotation, setRotation] = useState<RotationDefinition | null>(null);
    const [users, setUsers] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<EditRotationForm>();

    const cadence = watch("cadence");

    const loadRotation = async () => {
        if (!id) return;

        const data = await RotationAPI.getOne(id);
        setRotation(data);

        const usersList = await UsersAPI.getAll();
        setUsers(usersList);

        reset({
            name: data.name,
            code: data.code,
            type: data.type,
            cadence: data.cadence,
            cadence_interval: data.cadence_interval,
            allow_overlap: data.allow_overlap,
            min_assignees: data.min_assignees,
            scope_type: data.scope_type,
            scope_ref_id: data.scope_ref_id ?? null,
            owner_id: data.owner_id ?? null,
            description: data.description ?? "",
            is_active: data.is_active,
        });

        setLoading(false);
    };

    useEffect(() => {
        loadRotation();
    }, [id]);

    const onSubmit = async (data: EditRotationForm) => {
        if (!id) return;

        await RotationAPI.update(id, data);

        navigate(`/rotations/${id}`);
    };

    if (loading || !rotation) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h5" fontWeight={600} mb={3}>
                Edit Rotation
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

                        {/* Code
                        <TextField
                            label="Code"
                            fullWidth
                            {...register("code", { required: "Code is required" })}
                            error={!!errors.code}
                            helperText={errors.code?.message}
                        /> */}

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

                        {/* Minimum Assignees */}
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
                            {SCOPE_TYPES.map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Scope Selector */}
                        <ScopeSelector
                            scopeType={watch("scope_type")}
                            value={watch("scope_ref_id") ?? null}
                            onChange={(v) => setValue("scope_ref_id", v ?? undefined)}
                        />

                        {/* Rotation Owner */}
                        <TextField
                            select
                            label="Rotation Owner"
                            fullWidth
                            {...register("owner_id")}
                        >
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.email})
                                </MenuItem>
                            ))}
                        </TextField>

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
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}