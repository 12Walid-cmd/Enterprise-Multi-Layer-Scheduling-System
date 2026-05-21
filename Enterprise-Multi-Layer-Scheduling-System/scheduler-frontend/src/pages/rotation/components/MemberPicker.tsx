import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";

interface Props {
    type: string; // USER | TEAM | SUBTEAM | ROLE | DOMAIN
    value: string | null;
    onChange: (v: string | null) => void;
}


import { UsersAPI, TeamsAPI, SubTeamsAPI } from "../../../api";

import { TeamRoleTypesAPI, GlobalRoleTypesAPI } from "../../../api";
// import { DomainsAPI } from "../../../api";

interface Option {
    id: string;
    label: string;
}

export default function MemberPicker({ type, value, onChange }: Props) {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);

    const loadOptions = async () => {
        setLoading(true);

        let data: Option[] = [];

        switch (type) {
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
                data = res.map((t: any) => ({
                    id: t.id,
                    label: t.name,
                }));
                break;
            }

            case "SUBTEAM": {
                const teams = await TeamsAPI.getAll();

                const allSubteams: any[] = [];

                for (const t of teams) {
                    const subs = await SubTeamsAPI.getAll(t.id);
                    allSubteams.push(...subs);
                }

                data = allSubteams.map((s: any) => ({
                    id: s.id,
                    label: `${s.name} (Team: ${s.team_id})`,
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
                // const res = await DomainsAPI.getAll();
                // data = res.map((d: any) => ({
                //   id: d.id,
                //   label: d.name,
                // }));
                data = []; // Domains not implemented yet
                break;
            }
        }

        setOptions(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOptions();
    }, [type]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={1}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (options.length === 0) {
        return <Typography>No {type.toLowerCase()}s available.</Typography>;
    }

    return (
        <Select
            fullWidth
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                    {opt.label}
                </MenuItem>
            ))}
        </Select>
    );
}