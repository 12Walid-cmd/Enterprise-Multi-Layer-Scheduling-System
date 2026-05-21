import { useEffect, useState } from "react";
import { Box, CircularProgress, MenuItem, Select, Typography } from "@mui/material";

import { UsersAPI, TeamsAPI, TeamRoleTypesAPI, GlobalRoleTypesAPI } from "../../../api";


interface Props {
    scopeType: string | undefined;
    value: string | null | undefined;
    onChange: (v: string | null) => void;
}

interface Option {
    id: string;
    label: string;
}

export default function ScopeSelector({ scopeType, value, onChange }: Props) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const safeScopeType = scopeType ?? "";
    const loadOptions = async () => {
        setLoading(true);

        let data: Option[] = [];

        switch (safeScopeType) {
            case "USER": {
                const res = await UsersAPI.getAll();
                data = res.map((u: any) => ({
                    id: u.id,
                    label: `${u.first_name} ${u.last_name} (${u.email})`,
                }));
                break;
            }

            case "TEAM": {
                const res = await TeamsAPI.getAll();
                data = res
                    .filter((t: any) => t.parent_team_id === null)
                    .map((t: any) => ({
                        id: t.id,
                        label: t.name,
                    }));
                break;
            }

            case "SUBTEAM": {
                const teams = await TeamsAPI.getAll();
                const teamMap = new Map(teams.map((t: any) => [t.id, t.name])); 

                const allSubteams = teams.filter((t: any) => t.parent_team_id !== null); 

                data = allSubteams.map((s: any) => ({
                    id: s.id,
                    label: `${s.name} (Team: ${teamMap.get(s.parent_team_id)})`, 
                }));

                break;
            }
            case "ROLE": {
                const teamRoles = await TeamRoleTypesAPI.getAll();
                const globalRoles = await GlobalRoleTypesAPI.getAll();

                data = [
                    ...teamRoles.map((r: any) => ({
                        id: r.id,
                        label: `Team Role: ${r.name}`,
                    })),
                    ...globalRoles.map((r: any) => ({
                        id: r.id,
                        label: `Global Role: ${r.name}`,
                    })),
                ];
                break;
            }

            case "DOMAIN": {
                data = [];
                break;
            }
        }

        setOptions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOptions();
    }, [safeScopeType]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={1}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (options.length === 0) {
        return <Typography>No {safeScopeType.toLowerCase()}s available.</Typography>;
    }

    return (
        <Select fullWidth value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {options.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                    {opt.label}
                </MenuItem>
            ))}
        </Select>
    );
}