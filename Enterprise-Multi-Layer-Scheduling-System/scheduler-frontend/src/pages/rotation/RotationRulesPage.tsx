import {
    Box,
    Stack,
    Typography,
    Button,
    Paper,
    IconButton,
    Divider,
    CircularProgress,
    Tooltip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { RotationAPI, RuleAPI } from "../../api";
import type { RotationDefinition, RotationRule } from "../../types/rotation";

export default function RotationRulesPage() {
    const navigate = useNavigate();
    const { id: rotationId } = useParams();

    const [rotation, setRotation] = useState<RotationDefinition | null>(null);
    const [rules, setRules] = useState<RotationRule[]>([]);

    const [loading, setLoading] = useState(true);

    const [openAddRule, setOpenAddRule] = useState(false);
    const [editRule, setEditRule] = useState<RotationRule | null>(null);

    const RotationRuleType = {
        MIN_STAFF: "MIN_STAFF",
        MAX_STAFF: "MAX_STAFF",
        NO_OVERLAP: "NO_OVERLAP",
        ALLOW_OVERLAP: "ALLOW_OVERLAP",
        NO_DOUBLE_BOOKING: "NO_DOUBLE_BOOKING",
        SKIP_WEEKENDS: "SKIP_WEEKENDS",
        SKIP_HOLIDAYS: "SKIP_HOLIDAYS",
        COVERAGE_WINDOW: "COVERAGE_WINDOW",
        TIME_RANGE_BLOCK: "TIME_RANGE_BLOCK",
        BLOCK_DURING_LEAVE: "BLOCK_DURING_LEAVE",
        BLOCK_DURING_PENDING_LEAVE: "BLOCK_DURING_PENDING_LEAVE",
        REQUIRE_TIER_COVERAGE: "REQUIRE_TIER_COVERAGE",
        REQUIRE_DOMAIN_COVERAGE: "REQUIRE_DOMAIN_COVERAGE",
        REQUIRE_TEAM_COVERAGE: "REQUIRE_TEAM_COVERAGE",
        CUSTOM_CONSTRAINT: "CUSTOM_CONSTRAINT",

        FIXED_BLOCK: "FIXED_BLOCK",
        BLOCK_LENGTH: "BLOCK_LENGTH",
        SEQUENTIAL: "SEQUENTIAL",
        WEIGHTED: "WEIGHTED",
        ROUND_ROBIN: "ROUND_ROBIN",
        RANDOMIZED: "RANDOMIZED",
        SKIP_INACTIVE: "SKIP_INACTIVE",
        SKIP_ON_LEAVE: "SKIP_ON_LEAVE",
        PRIORITIZE_SENIORITY: "PRIORITIZE_SENIORITY",
        PRIORITIZE_TEAM: "PRIORITIZE_TEAM",
        PRIORITIZE_TIMEZONE: "PRIORITIZE_TIMEZONE",
        TIER_LEVEL: "TIER_LEVEL",
        ESCALATION_CHAIN: "ESCALATION_CHAIN",
        CROSS_TEAM_ROTATION: "CROSS_TEAM_ROTATION",
        CROSS_DOMAIN_ROTATION: "CROSS_DOMAIN_ROTATION",
        ANALYST_POOL_ROTATION: "ANALYST_POOL_ROTATION",
        TIMEZONE_AWARE: "TIMEZONE_AWARE",
        CUSTOM_GENERATION: "CUSTOM_GENERATION",
    } as const;

    type RotationRuleType = keyof typeof RotationRuleType;

    // ---------------------------------------------
    // Inline ruleFormSchema
    // ---------------------------------------------
    const ruleFormSchema: Record<string, any[]> = {
        MIN_STAFF: [{ field: "min", label: "Minimum Staff", type: "number" }],
        MAX_STAFF: [{ field: "max", label: "Maximum Staff", type: "number" }],
        BLOCK_LENGTH: [{ field: "days", label: "Block Length (days)", type: "number" }],
        FIXED_BLOCK: [{ field: "days", label: "Block Size (days)", type: "number" }],
        SEQUENTIAL: [{ field: "enabled", label: "Enable Sequential Rotation", type: "boolean" }],
        WEIGHTED: [{ field: "field", label: "Weight Field", type: "text" }],
        SKIP_INACTIVE: [{ field: "enabled", label: "Skip Inactive Members", type: "boolean" }],
        TIMEZONE_AWARE: [{ field: "enabled", label: "Timezone Aware Scheduling", type: "boolean" }],
        TIER_LEVEL: [{ field: "tier", label: "Tier Level", type: "number" }],
        COVERAGE_WINDOW: [
            { field: "start", label: "Start Time", type: "time" },
            { field: "end", label: "End Time", type: "time" },
        ],
        CUSTOM_GENERATION: [{ field: "script", label: "Custom Script", type: "textarea" }],
    };

    // ---------------------------------------------
    // Load Data
    // ---------------------------------------------
    const loadData = async () => {
        if (!rotationId) return;

        setLoading(true);

        const [rotationData, ruleData] = await Promise.all([
            RotationAPI.getOne(rotationId),
            RuleAPI.getRules(rotationId),
        ]);

        setRotation(rotationData);
        setRules(ruleData);

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [rotationId]);

    const handleDeleteRule = async (ruleId: string) => {
        await RuleAPI.removeRule(rotationId!, ruleId);
        loadData();
    };

    // ---------------------------------------------
    // Add Rule Dialog
    // ---------------------------------------------
    const AddRuleDialog = () => {
        const [ruleType, setRuleType] = useState("");
        const [payload, setPayload] = useState<Record<string, any>>({});

        const schema = ruleFormSchema[ruleType] || [];

        const handleSubmit = async () => {
            await RuleAPI.addRule(rotationId!, {
                ruleType,
                rulePayload: payload,
            });
            setOpenAddRule(false);
            loadData();
        };

        return (
            <Dialog open={openAddRule} onClose={() => setOpenAddRule(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Rule</DialogTitle>

                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        label="Rule Type"
                        value={ruleType}
                        onChange={(e) => {
                            setRuleType(e.target.value);
                            setPayload({});
                        }}
                        sx={{ mt: 1 }}
                    >
                        {Object.values(RotationRuleType).map((rt) => (
                            <MenuItem key={rt} value={rt}>
                                {rt}
                            </MenuItem>
                        ))}
                    </TextField>

                    {schema.map((field) => (
                        <TextField
                            key={field.field}
                            fullWidth
                            label={field.label}
                            type={field.type}
                            value={payload[field.field as string] ?? ""}
                            onChange={(e) =>
                                setPayload({
                                    ...payload,
                                    [field.field as string]: e.target.value,
                                })
                            }
                            sx={{ mt: 2 }}
                        />
                    ))}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenAddRule(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // ---------------------------------------------
    // Edit Rule Dialog
    // ---------------------------------------------
    const EditRuleDialog = ({ rule }: { rule: RotationRule }) => {
        const [payload, setPayload] = useState(rule.rule_payload || {});
        const schema = ruleFormSchema[rule.rule_type] || [];

        const handleSubmit = async () => {
            await RuleAPI.updateRule(rotationId!, rule.id, { rulePayload: payload });
            setEditRule(null);
            loadData();
        };

        return (
            <Dialog open={true} onClose={() => setEditRule(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Rule — {rule.rule_type}</DialogTitle>

                <DialogContent>
                    {schema.map((field) => (
                        <TextField
                            key={field.field}
                            fullWidth
                            label={field.label}
                            type={field.type}
                            value={payload[field.field] ?? ""}
                            onChange={(e) =>
                                setPayload({ ...payload, [field.field]: e.target.value })
                            }
                            sx={{ mt: 2 }}
                        />
                    ))}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setEditRule(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    };

    // ---------------------------------------------
    // Render
    // ---------------------------------------------
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    if (!rotation) {
        return (
            <Box p={3}>
                <Typography color="error" textAlign="center" mt={3}>
                    Rotation not found
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/rotations/${rotation.id}`)}
                >
                    Back
                </Button>

                <Typography variant="h5" fontWeight={600}>
                    Rotation Rules — {rotation.name}
                </Typography>

                <Box flexGrow={1} />

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddRule(true)}
                >
                    Add Rule
                </Button>
            </Stack>

            {/* Rule List */}
            <Stack spacing={3}>
                {rules.map((rule) => (
                    <Paper
                        key={rule.id}
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={600}>
                                {rule.rule_type}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit Rule">
                                    <IconButton onClick={() => setEditRule(rule)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete Rule">
                                    <IconButton color="error" onClick={() => handleDeleteRule(rule.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" color="text.secondary">
                            {JSON.stringify(rule.rule_payload, null, 2)}
                        </Typography>
                    </Paper>
                ))}
            </Stack>

            {/* Dialogs */}
            {openAddRule && <AddRuleDialog />}
            {editRule && <EditRuleDialog rule={editRule} />}

        </Box>
    );
}