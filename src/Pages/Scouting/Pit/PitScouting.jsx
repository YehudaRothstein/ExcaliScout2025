import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../../../firebase-config";
import {ref, push, set} from "firebase/database";
import { UserContext } from "../../../context/UserContext";
import { ThemeContext } from "../../../context/ThemeContext";
import { green, red } from '@mui/material/colors';
import {
    Box,
    Button,
    Typography,
    TextField,
    CircularProgress,
    Paper,
    Select,
    MenuItem,
    Slider,
    Divider,
    Card,
    CardContent,
    CardHeader
} from "@mui/material";

const questionsList = {
    0: { question: "גובה הטיפוס (מטר מקסימלי)", type: "scale" },
    1: { question: "האם הטיפוס מפריע לקבוצה אחרת לטפס", type: "yesno" },
    2: { question: "האם הרובוט מסוגל לנקד ב L1", type: "yesno" },
    3: { question: "האם הרובוט מסוגל לנקד בL2 ", type: "yesno" },
    4: { question: "האם הרובוט מסוגל לנקד ב L3", type: "yesno" },
    5: { question: "האם הרובוט מסוגל לנקד בL4 ", type: "yesno" },
    6: { question: "האם הרובוט מסוגל לאסוף מהרצפה", type: "yesno" },
    7: { question: "האם הרובוט מסוגל לאסוף מהפידר", type: "yesno" },
    8: { question: "האם הרובוט מסוגל לנקד Algae בפרוססור", type: "yesno" },
    9: { question: "האם הרובוט מסוגל לנקד Algae ברשת", type: "yesno" },
    10: { question: "האם הרובוט יוצא מאזור ההתחלה באוטונומי", type: "yesno" },
    11: { question: "האם אתם מסוגלים להעיף Algae מהריף", type: "yesno" },
    12: { question: "תאר פירוט אוטונומיי לגבי כל מסלול", type: "open" },
    13: { question: "הערות כלליות אחרות", type: "open" },
};

function PitScouting() {
    const { user } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { teamNumber } = location.state || {};
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [manualTeamNumber, setManualTeamNumber] = useState(teamNumber || "");

    useEffect(() => {
        if (!user) {
            console.error("User not found.");
            navigate("/login");
        }
    }, [user, navigate]);

    const handleChange = (event, questionId, newValue) => {
        setFormData({
            ...formData,
            [questionId]: newValue !== undefined ? newValue : event.target.value,
        });
    };

        const handleManualSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const dataToSend = {
            username: user?.username || "Unknown User",
            answers: Object.keys(questionsList).reduce((acc, questionId) => {
                acc[questionId] = formData[questionId] || "";
                return acc;
            }, {}),
        };

        try {
            const pitScoutingRef = ref(db, `pitScoutingResults/${manualTeamNumber}`);
            await set(pitScoutingRef, dataToSend);
            alert("Data submitted successfully!");
        } catch (error) {
            console.error("Error submitting data:", error);
            alert("Error submitting data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 900, margin: "auto", direction: "rtl", backgroundColor: theme === 'dark' ? '#333' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
            <Card sx={{ mb: 3, backgroundColor: user ? (theme === 'dark' ? green[900] : green[50]) : (theme === 'dark' ? red[900] : red[50]), borderRadius: 2, boxShadow: 3 }}>
                <CardHeader
                    title="User Status"
                    sx={{
                        textAlign: "right",
                        backgroundColor: user ? (theme === 'dark' ? green[700] : green[700]) : (theme === 'dark' ? red[700] : red[700]),
                        color: "#fff",
                        borderRadius: "8px 8px 0 0",
                    }}
                />
                <CardContent>
                    <Typography variant="h6" sx={{ textAlign: "right" }}>
                        {user ? user.username : "User not logged in."}
                    </Typography>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3, backgroundColor: theme === 'dark' ? '#424242' : "#f5f5f5", borderRadius: 2, boxShadow: 3 }}>
                <CardHeader
                    title="Team Information"
                    sx={{ textAlign: "right", backgroundColor: theme === 'dark' ? '#616161' : "#e0e0e0", borderRadius: "8px 8px 0 0" }}
                />
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', textAlign: "right" }}>
                        Team Number: {manualTeamNumber || "Not Provided"}
                    </Typography>

                    {!teamNumber && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1, textAlign: "right" }}>
                                Enter Team Number:
                            </Typography>
                            <TextField
                                variant="outlined"
                                fullWidth
                                value={manualTeamNumber}
                                onChange={(e) => setManualTeamNumber(e.target.value)}
                                type="number"
                                sx={{ mb: 2, backgroundColor: theme === 'dark' ? '#616161' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Divider sx={{ marginY: 3, backgroundColor: theme === 'dark' ? '#757575' : '#000' }} />

            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, boxShadow: 3, backgroundColor: theme === 'dark' ? '#424242' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}>
                <form onSubmit={handleManualSubmit}>
                    {Object.keys(questionsList).map((questionId) => {
                        const question = questionsList[questionId];
                        return (
                            <Box key={questionId} sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1, textAlign: "right" }}>
                                    {question.question}
                                </Typography>
                                {question.type === "yesno" && (
                                    <Select
                                        variant="outlined"
                                        fullWidth
                                        value={formData[questionId] || ""}
                                        onChange={(e) => handleChange(e, questionId)}
                                        sx={{ mb: 2, backgroundColor: theme === 'dark' ? '#616161' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                                    >
                                        <MenuItem value="yes">כן</MenuItem>
                                        <MenuItem value="no">לא</MenuItem>
                                    </Select>
                                )}
                                {question.type === "scale" && (
                                    <Slider
                                        value={formData[questionId] || 1}
                                        min={1}
                                        max={2}
                                        step={0.05}
                                        marks
                                        valueLabelDisplay="auto"
                                        onChange={(e, newValue) => handleChange(e, questionId, newValue)}
                                        sx={{ mb: 2, color: theme === 'dark' ? '#fff' : '#000' }}
                                    />
                                )}
                                {question.type === "open" && (
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={formData[questionId] || ""}
                                        onChange={(e) => handleChange(e, questionId)}
                                        sx={{ mb: 2, backgroundColor: theme === 'dark' ? '#616161' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                                    />
                                )}
                            </Box>
                        );
                    })}

                    <Box sx={{ textAlign: "center" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{
                                mt: 3,
                                px: 4,
                                bgcolor: "#d4af37",
                                "&:hover": { bgcolor: "#b68e2f" },
                            }}
                            type="submit"
                            disabled={loading || !manualTeamNumber}
                        >
                            {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit"}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}

export default PitScouting;