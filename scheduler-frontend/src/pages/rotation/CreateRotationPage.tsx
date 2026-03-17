import { useForm } from "react-hook-form";
import { generateRotationCode } from "../../utils/rotation";
import {
    Box,
    Button,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ScopeSelector from "./components/ScopeSelector";
import { RotationAPI, UsersAPI } from "../../api";
import { useEffect, useState } from "react";

const ROTATION_TYPES = ["TEAM", "SUBTEAM", "ROLE", "DOMAIN", "CROSS_TEAM"] as const;
const CADENCE_TYPES = ["DAILY", "WEEKLY", "BIWEEKLY", "CUSTOM"] as const;
const SCOPE_TYPES = ["TEAM", "SUBTEAM", "GROUP", "ROLE", "DOMAIN", "NONE"] as const;

interface CreateRotationForm {
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

export default function CreateRotationPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CreateRotationForm>({
        defaultValues: {
            cadence_interval: 1,
            allow_overlap: false,
            min_assignees: 1,
            is_active: true,
        },
    });

    const cadence = watch("cadence");


    useEffect(() => {
        UsersAPI.getAll().then(setUsers);
    }, []);

    const onSubmit = async (data: CreateRotationForm) => {
        const code = generateRotationCode(data.name, data.type, data.cadence);
        const created = await RotationAPI.create({
            ...data,
            code,
        });
        navigate(`/rotations/${created.id}`);
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
                                Create
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}