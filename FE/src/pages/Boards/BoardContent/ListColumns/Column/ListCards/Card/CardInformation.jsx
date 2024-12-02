import "react-quill/dist/quill.snow.css";
import { API_AI } from "~/utils/constans";
import {
    ACTION_AI,
    TOKEN_AUTHENTICATION,
    ACTION_UPDATE_DESCRIPTION,
} from "~/utils/constans";

import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    Box,
    Typography,
    Avatar,
    Divider,
    Button,
    IconButton,
    InputBase,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TextField,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CardInformationRightPane from "./CardInformationRightPane";
import * as apiServices from "~/apis";
import ReactQuill from "react-quill";
import Ink from "react-ink";
import { set } from "lodash";
import { toast } from "react-toastify";

const modalStyle = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    maxWidth: 800,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "row",
    position: "relative",
    overflow: "auto",
};

const leftPaneStyle = {
    flex: 1,
    paddingRight: "16px",
    overflow: "auto",
};

const body = {
    conversation_id: "31223",
    bot_id: "7442735215879520273",
    user: "demo",
    stream: true,
};

const CardInformation = ({ board, openCardInformation, onClose, card }) => {
    const [description, setDescription] = useState(
        card ? card.attachments : ""
    );
    const [isEditing, setIsEditing] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editedTitle, setEditedTitle] = useState(card.title);
    const [newComment, setNewComment] = useState("");
    const [members, setMembers] = useState(card ? card.members || [] : []);
    const [anchorEl, setAnchorEl] = useState(null);
    const [boardMembers, setBoardMembers] = useState([]);
    const [user, setUser] = useState(null);
    const [coverImage, setCoverImage] = useState(card ? card.cover : "");
    const fileInputRef = useRef(null);
    const [comments, setComments] = useState(card.comments || []);
    const [openBoxAI, setOpenBoxAI] = useState(false);
    const [aiResponse, setAIResponse] = useState("");
    const menuAI = useRef(null);
    const aiContainerRef = useRef(null);
    const [showContainerReponse, setShowContainerReponse] = useState(false);
    const [contentAndActionAI, setContentAndActionAI] = useState({
        content: "",
        action: "", //ACTION_AI
        labelShow: "", // danh cho action change tone
    });

    useEffect(() => {
        if (board) {
            apiServices
                .fetchInforUserBoardsAPI(board._id)
                .then((res) => {
                    if (res.board && Array.isArray(res.board.members)) {
                        setBoardMembers(res.board.members);
                    } else {
                        console.error(
                            "Members array not found in response:",
                            res
                        );
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch info member", error);
                });
        }

        document.addEventListener("mousedown", (event) => {
            if (
                aiContainerRef.current &&
                !aiContainerRef.current.contains(event.target)
            ) {
                setOpenBoxAI(false);
            }
        });
    }, [board]);

    useEffect(() => {
        const fetchUserData = async () => {
            const ownerIds = localStorage.getItem("ownerIds");
            if (ownerIds) {
                try {
                    const userData = await apiServices.fetchUserInfoAPI(
                        ownerIds
                    );
                    setUser(userData);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const handleDragStart = (e) => {
            if (openCardInformation) {
                e.preventDefault();
            }
        };

        document.addEventListener("dragstart", handleDragStart);

        return () => {
            document.removeEventListener("dragstart", handleDragStart);
        };
    }, [openCardInformation]);

    const handleDescriptionChange = (value) => {
        setDescription(value);
    };

    const handleTitleClick = () => {
        setIsEdit(true);
    };

    const handleTitleBlur = async () => {
        if (editedTitle !== card.title) {
            try {
                await updateCardDetailsAPI(card._id, { title: editedTitle });
                card.title = editedTitle; // Update local state
            } catch (error) {
                console.error("Failed to update card title:", error);
            }
        }
        setIsEdit(false);
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleTitleBlur();
        }
    };

    const handleTitleChange = (event) => {
        setEditedTitle(event.target.value);
    };

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleAddMemberClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMemberSelect = async (member) => {
        setAnchorEl(null);
        const isMember = members.some((m) => m._id === member._id);

        if (isMember) {
            try {
                await removeMemberFromCardAPI(card._id, member._id);
                setMembers((prevMembers) =>
                    prevMembers.filter((m) => m._id !== member._id)
                );
                console.log("Member removed from card successfully");
            } catch (error) {
                console.error("Failed to remove member from card:", error);
            }
        } else {
            try {
                await addMemberToCardAPI(card._id, member._id);
                setMembers((prevMembers) => [...prevMembers, member]);
                console.log("Member added to card successfully");
            } catch (error) {
                console.error("Failed to add member to card:", error);
            }
        }
    };

    const handleCoverButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // Trigger the file input click
        }
    };

    const handleCoverImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await updateCardDetailsAPI(card._id, {
                        cover: reader.result,
                    });
                    setCoverImage(reader.result);
                    card.cover = reader.result; // Update local state
                } catch (error) {
                    console.error("Failed to update card cover:", error);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleEditClick = async () => {
        if (isEditing && description !== card.attachments) {
            try {
                await updateCardDetailsAPI(card._id, {
                    attachments: description,
                });
                card.attachments = description; // Update local state
            } catch (error) {
                console.error("Failed to update card description:", error);
            }
        }
        setIsEditing(!isEditing);
    };

    const handleAddComment = async () => {
        if (newComment.trim()) {
            // Kiểm tra xem bình luận mới đã tồn tại trong danh sách hay chưa
            const existingComment = comments.find(
                (comment) =>
                    comment.user.id === user.id &&
                    comment.content === newComment
            );

            // Nếu bình luận mới không tồn tại, thêm vào danh sách
            if (!existingComment) {
                const newActivity = {
                    user: {
                        id: user ? user.id : "",
                        name: user ? user.username : "",
                        avatar: user ? user.avatar : "",
                    },
                    content: newComment,
                    timestamp: new Date().toISOString(),
                };
                try {
                    const updatedComments = [...comments, newActivity];
                    console.log("Updated comments:", updatedComments); // Log the updated comments array
                    await updateCardDetailsAPI(card._id, {
                        comments: updatedComments,
                    });
                    setComments(updatedComments);
                    setNewComment("");
                    console.log("Comment added successfully!");
                } catch (error) {
                    console.error("Failed to add comment to card:", error);
                }
            } else {
                // Nếu bình luận mới đã tồn tại, chỉ cập nhật nội dung của bình luận đó
                existingComment.content = newComment;
                try {
                    await updateCardDetailsAPI(card._id, {
                        comments: comments,
                    });
                    setNewComment("");
                    console.log("Comment updated successfully!");
                } catch (error) {
                    console.error("Failed to update comment on card:", error);
                }
            }
        }
    };

    const handleCommentKeyPress = (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default form submission behavior
            handleAddComment();
        }
    };

    const fetchAI = async (action, content) => {
        setShowContainerReponse(true);
        if (content === "" || content === "<p><br></p>") {
            toast.warning("Please enter the content to process");
            return;
        }

        try {
            const response = await fetch(API_AI, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${TOKEN_AUTHENTICATION}`,
                },
                body: JSON.stringify({
                    ...body,
                    query: `${action}, ${content}`,
                }),
            });
            // lay readable stream tu response
            const reader = response.body.getReader();
            // tao 1 bo gia ma nhi phan sang text
            const decoder = new TextDecoder("utf-8");
            let tempContent = "";

            const exampleJson = {
                event: "message",
                message: {
                    role: "assistant",
                    type: "answer",
                    content: " g",
                    content_type: "text",
                },

                is_finish: false,
                index: 0,
                conversation_id: "31223",
                seq_id: 87,
            };

            while (true) {
                const data = await reader.read();
                const { done, value } = data;
                if (done) break;

                // chuyen doi tu lieu tu binary sang dang text
                const chunk = decoder.decode(value, { stream: true });
                const events = chunk.split("\n\n");
                for (const event of events) {
                    if (event.startsWith("data:")) {
                        const jsonStr = event.replace("data:", "").trim();
                        try {
                            const json = JSON.parse(jsonStr);
                            console.log(json);
                            if (json.is_finish) {
                                return;
                            }
                            if (
                                json.event === "message" &&
                                json.message?.content
                            ) {
                                tempContent += json.message.content;
                                setAIResponse(tempContent);
                            }
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(
                "There has been a problem with your fetch operation:",
                error
            );
            return Promise.reject(error);
        } finally {
            setContentAndActionAI((prev) => ({
                ...prev,
                content: "",
                labelShow: "",
            }));
        }
    };

    const handleCallAI = (action) => {
        switch (action) {
            case ACTION_AI.SUMMARY:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.SUMMARY,
                }));
                fetchAI(ACTION_AI.SUMMARY, description);
                break;
            case ACTION_AI.IMPROVE_WRITING:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.IMPROVE_WRITING,
                }));
                fetchAI(ACTION_AI.SUMMARY, description);
                break;
            case ACTION_AI.FIX_ERRORS:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.FIX_ERRORS,
                }));
                fetchAI(ACTION_AI.FIX_ERRORS, description);
                break;
            case ACTION_AI.GENERATE_IDEA:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.GENERATE_IDEA,
                }));
                showContainerReponseAI();
                break;
            case ACTION_AI.SHORTEN:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.SHORTEN,
                }));
                fetchAI(ACTION_AI.SHORTEN, description);
                break;
            case ACTION_AI.CHANGE_TONE:
                setContentAndActionAI((prev) => ({
                    ...prev,
                    action: ACTION_AI.CHANGE_TONE,
                }));
                showContainerReponseAI();
                // fetchAI(ACTION_AI.CHANGE_TONE, contentAndActionAI.content);
                break;
            default:
                console.log("Unknown action");
                break;
        }
    };

    const showContainerReponseAI = () => {
        setShowContainerReponse(true);
        setAIResponse("");
    };

    useEffect(() => {
        if (openBoxAI && aiContainerRef.current) {
            aiContainerRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [openBoxAI]);

    const handleUpdateDescriptionFromAIResponse = (action) => {
        switch (action) {
            case ACTION_UPDATE_DESCRIPTION.INSERT:
                setDescription(`${description}<br>${aiResponse}`);
                break;
            case ACTION_UPDATE_DESCRIPTION.REPLACE:
                setDescription(aiResponse);
                break;
            case ACTION_UPDATE_DESCRIPTION.DISCARD:
                break;
            default:
                console.log("Unknown action");
                break;
        }
        setAIResponse("");
        setOpenBoxAI(false);
        setShowContainerReponse(false);
    };

    const handleChangeTone = (tone) => {
        setContentAndActionAI((prev) => ({ ...prev, labelShow: tone }));
        fetchAI(ACTION_AI.CHANGE_TONE + " with tone " + tone, description);
        return;
    };

    return (
        <div>
            <Modal open={openCardInformation} onClose={onClose}>
                <Box sx={{ ...modalStyle, overflow: "hidden" }}>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: "absolute",
                            color: "red",
                            top: 0,
                            right: 0,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box
                        sx={leftPaneStyle}
                        style={{ maxHeight: "calc(100vh - 96px)" }}
                    >
                        <Box sx={{ position: "relative", mb: 2 }}>
                            {coverImage && (
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    style={{
                                        width: "100%",
                                        height: "275px",
                                        borderRadius: "8px",
                                    }}
                                />
                            )}
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <CreditCardIcon
                                style={{ marginRight: "15px", color: "black" }}
                            />
                            {isEdit ? (
                                <TextField
                                    value={editedTitle}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                />
                            ) : (
                                <Typography
                                    variant="h6"
                                    onClick={handleTitleClick}
                                    style={{ cursor: "pointer" }}
                                >
                                    {card.title}
                                </Typography>
                            )}
                        </Box>
                        <Typography sx={{ flex: 1, mt: 2, color: "#0984e3" }}>
                            Members
                        </Typography>
                        <Box sx={{ display: "flex", mt: 1 }}>
                            {members.map((member) => (
                                <Avatar
                                    key={member._id}
                                    sx={{ width: 28, height: 28, mr: 1 }}
                                    src={member.avatar}
                                >
                                    {members.some(
                                        (m) => m._id === member._id
                                    ) && (
                                        <CheckIcon
                                            sx={{
                                                position: "absolute",
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: "white",
                                                borderRadius: "50%",
                                                color: "green",
                                            }}
                                        />
                                    )}
                                </Avatar>
                            ))}
                            <Avatar
                                sx={{
                                    width: 28,
                                    height: 28,
                                    mr: 1,
                                    bgcolor: "#ccc",
                                    cursor: "pointer",
                                }}
                                onClick={handleAddMemberClick}
                            >
                                +
                            </Avatar>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                {boardMembers.map((member) => (
                                    <MenuItem
                                        key={member._id}
                                        onClick={() => {
                                            handleMemberSelect(member);
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Avatar
                                                src={member.avatar}
                                                sx={{ width: 28, height: 28 }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {member.name}
                                        </ListItemText>
                                        {members.some(
                                            (m) => m._id === member._id
                                        ) && (
                                            <CheckIcon
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                    bgcolor: "white",
                                                    borderRadius: "50%",
                                                    color: "green",
                                                }}
                                            />
                                        )}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                            }}
                        >
                            <DescriptionOutlinedIcon
                                style={{ marginRight: "8px" }}
                            />
                            <Typography variant="subtitle1">
                                Description
                            </Typography>
                            <Button
                                onClick={handleEditClick}
                                size="small"
                                style={{
                                    textTransform: "none",
                                    marginLeft: "auto",
                                }}
                            >
                                {isEditing ? "Save" : "Edit"}
                            </Button>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            {isEditing ? (
                                <div>
                                    <button
                                        ref={menuAI}
                                        className="btn-ai"
                                        onClick={() => {
                                            setOpenBoxAI(!openBoxAI);
                                        }}
                                    >
                                        <Ink></Ink>
                                        AI ASSISTANT
                                    </button>
                                    <div className="desc">
                                        {openBoxAI && (
                                            <div
                                                ref={aiContainerRef}
                                                className="ai-container"
                                            >
                                                {showContainerReponse ? (
                                                    <div className="subContent">
                                                        <div className="header-tag">
                                                            <div
                                                                onClick={() =>
                                                                    setShowContainerReponse(
                                                                        false
                                                                    )
                                                                }
                                                                className="flex items-start"
                                                            >
                                                                <div className="btn-back">
                                                                    <svg
                                                                        fill="none"
                                                                        viewBox="0 0 12 12"
                                                                        role="presentation"
                                                                        width={
                                                                            12
                                                                        }
                                                                        height={
                                                                            12
                                                                        }
                                                                    >
                                                                        <path
                                                                            stroke="#344663"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="1.5"
                                                                            d="M7.5 10.5 3 6l4.5-4.5"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className="tag">
                                                                    {
                                                                        contentAndActionAI.action
                                                                    }
                                                                </span>
                                                                {contentAndActionAI.labelShow && (
                                                                    <span className="sub-label">
                                                                        {
                                                                            contentAndActionAI.labelShow
                                                                        }
                                                                    </span>
                                                                )}
                                                                {contentAndActionAI.action ===
                                                                    ACTION_AI.GENERATE_IDEA && (
                                                                    <div className="flex gap-2">
                                                                        <input
                                                                            value={
                                                                                contentAndActionAI.content
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                setContentAndActionAI(
                                                                                    (
                                                                                        prev
                                                                                    ) => ({
                                                                                        ...prev,
                                                                                        content:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    })
                                                                                );
                                                                            }}
                                                                            onKeyDown={(
                                                                                e
                                                                            ) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    "Enter"
                                                                                ) {
                                                                                    fetchAI(
                                                                                        ACTION_AI.GENERATE_IDEA,
                                                                                        contentAndActionAI.content
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className="ip-idea"
                                                                            type="text"
                                                                            placeholder="Tell me the topic..."
                                                                        />
                                                                        <button
                                                                            onClick={() => {
                                                                                handleCallAI(
                                                                                    ACTION_AI.GENERATE_IDEA
                                                                                );
                                                                            }}
                                                                            aria-label="Submit"
                                                                            data-testid="submit-icon-button"
                                                                            tabindex="0"
                                                                            type="submit"
                                                                            className="btn btn-discart"
                                                                        >
                                                                            <span class="css-bwxjrz">
                                                                                <svg
                                                                                    width="14"
                                                                                    height="12"
                                                                                    viewBox="0 0 14 12"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M4.63477 11.2256C5.12012 11.2256 5.44141 10.8906 5.44141 10.4326C5.44141 10.1729 5.33203 9.98828 5.18164 9.83789L4.18359 8.86719L3.41113 8.24512L4.61426 8.2998H10.9102C12.4688 8.2998 13.1387 7.62988 13.1387 6.07129V2.89258C13.1387 1.33398 12.4688 0.657227 10.9102 0.657227H8.06641C7.58105 0.657227 7.21875 1.0332 7.21875 1.49121C7.21875 1.95605 7.58105 2.33203 8.06641 2.33203H10.835C11.3135 2.33203 11.5049 2.5166 11.5049 3.00195V5.96191C11.5049 6.44043 11.3135 6.63184 10.835 6.63184H4.61426L3.41113 6.68652L4.18359 6.06445L5.18164 5.10059C5.33203 4.94336 5.44141 4.76562 5.44141 4.50586C5.44141 4.04785 5.12012 3.70605 4.63477 3.70605C4.42285 3.70605 4.19727 3.80176 4.0332 3.96582L1.10742 6.85059C0.950195 7.00781 0.861328 7.24023 0.861328 7.46582C0.861328 7.69141 0.950195 7.93066 1.10742 8.08105L4.0332 10.9658C4.19727 11.1367 4.42285 11.2256 4.63477 11.2256Z"
                                                                                        fill="currentColor"
                                                                                    ></path>
                                                                                </svg>
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {/* {contentAndActionAI.action ===
                                                                    ACTION_AI.CHANGE_TONE && (
                                                                    <>
                                                                        <div className="flex gap-2">
                                                                            <input
                                                                                value={
                                                                                    contentAndActionAI.content
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    setContentAndActionAI(
                                                                                        (
                                                                                            prev
                                                                                        ) => ({
                                                                                            ...prev,
                                                                                            content:
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                        })
                                                                                    );
                                                                                }}
                                                                                onKeyDown={(
                                                                                    e
                                                                                ) => {
                                                                                    if (
                                                                                        e.key ===
                                                                                        "Enter"
                                                                                    ) {
                                                                                        handleCallAI(
                                                                                            ACTION_AI.CHANGE_TONE +
                                                                                                " with tone: " +
                                                                                                contentAndActionAI.content
                                                                                        );
                                                                                    }
                                                                                }}
                                                                                className="ip-idea"
                                                                                autoFocus={
                                                                                    true
                                                                                }
                                                                                type="text"
                                                                                placeholder=""
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleCallAI(
                                                                                        ACTION_AI.CHANGE_TONE +
                                                                                            " with tone: " +
                                                                                            contentAndActionAI.content
                                                                                    );
                                                                                }}
                                                                                aria-label="Submit"
                                                                                data-testid="submit-icon-button"
                                                                                tabindex="0"
                                                                                type="submit"
                                                                                className="btn btn-discart"
                                                                            >
                                                                                <span class="css-bwxjrz">
                                                                                    <svg
                                                                                        width="14"
                                                                                        height="12"
                                                                                        viewBox="0 0 14 12"
                                                                                        fill="none"
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                    >
                                                                                        <path
                                                                                            d="M4.63477 11.2256C5.12012 11.2256 5.44141 10.8906 5.44141 10.4326C5.44141 10.1729 5.33203 9.98828 5.18164 9.83789L4.18359 8.86719L3.41113 8.24512L4.61426 8.2998H10.9102C12.4688 8.2998 13.1387 7.62988 13.1387 6.07129V2.89258C13.1387 1.33398 12.4688 0.657227 10.9102 0.657227H8.06641C7.58105 0.657227 7.21875 1.0332 7.21875 1.49121C7.21875 1.95605 7.58105 2.33203 8.06641 2.33203H10.835C11.3135 2.33203 11.5049 2.5166 11.5049 3.00195V5.96191C11.5049 6.44043 11.3135 6.63184 10.835 6.63184H4.61426L3.41113 6.68652L4.18359 6.06445L5.18164 5.10059C5.33203 4.94336 5.44141 4.76562 5.44141 4.50586C5.44141 4.04785 5.12012 3.70605 4.63477 3.70605C4.42285 3.70605 4.19727 3.80176 4.0332 3.96582L1.10742 6.85059C0.950195 7.00781 0.861328 7.24023 0.861328 7.46582C0.861328 7.69141 0.950195 7.93066 1.10742 8.08105L4.0332 10.9658C4.19727 11.1367 4.42285 11.2256 4.63477 11.2256Z"
                                                                                            fill="currentColor"
                                                                                        ></path>
                                                                                    </svg>
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )} */}
                                                            </div>
                                                        </div>
                                                        {contentAndActionAI.action ===
                                                            ACTION_AI.CHANGE_TONE && (
                                                            <div className="border-t">
                                                                <ul className="options-tone-container">
                                                                    <li
                                                                        onClick={() =>
                                                                            handleChangeTone(
                                                                                "Proffessional"
                                                                            )
                                                                        }
                                                                    >
                                                                        <svg
                                                                            width="22"
                                                                            height="22"
                                                                            fill="#44546F"
                                                                            viewBox="0 0 24 24"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            role="presentation"
                                                                        >
                                                                            <path d="M6 20C5.49542 20.0002 5.00943 19.8096 4.63945 19.4665C4.26947 19.1234 4.04284 18.6532 4.005 18.15L4 18V10C3.99984 9.49542 4.19041 9.00943 4.5335 8.63945C4.87659 8.26947 5.34684 8.04284 5.85 8.005L6 8H8V6C7.99984 5.49542 8.19041 5.00943 8.5335 4.63945C8.87659 4.26947 9.34685 4.04284 9.85 4.005L10 4H14C14.5046 3.99984 14.9906 4.19041 15.3605 4.5335C15.7305 4.87659 15.9572 5.34684 15.995 5.85L16 6V8H18C18.5044 8.00009 18.9901 8.19077 19.3599 8.53384C19.7297 8.8769 19.9562 9.34702 19.994 9.85L20 10V18C19.9999 18.5044 19.8092 18.9901 19.4662 19.3599C19.1231 19.7297 18.653 19.9562 18.15 19.994L18 20H6ZM8 10H6V18H7.999L8 10ZM14 10H10L9.999 18H14V10ZM18 10H16V18H18V10ZM14 6H10V8H14V6Z"></path>
                                                                        </svg>
                                                                        Proffessional
                                                                    </li>
                                                                    <li
                                                                        onClick={() =>
                                                                            handleChangeTone(
                                                                                "Empathetic"
                                                                            )
                                                                        }
                                                                    >
                                                                        <span
                                                                            data-vc="icon-undefined"
                                                                            aria-hidden="true"
                                                                            class="css-snhnyn"
                                                                        >
                                                                            <svg
                                                                                width="22"
                                                                                height="22"
                                                                                fill="#44546F"
                                                                                viewBox="0 0 24 24"
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                role="presentation"
                                                                            >
                                                                                <path d="M11.121 5.385L11.278 5.535L11.985 6.242L12.692 5.536C13.6168 4.61388 14.8658 4.09021 16.1717 4.07699C17.4777 4.06378 18.7369 4.56205 19.6803 5.46527C20.6236 6.36848 21.1761 7.60494 21.2195 8.91022C21.263 10.2155 20.7941 11.486 19.913 12.45L19.763 12.607L18.352 14.018L12.71 19.704C12.5359 19.8796 12.3028 19.9845 12.0559 19.9983C11.809 20.0122 11.5657 19.934 11.373 19.779L11.292 19.706L5.62 14.02L4.207 12.607C3.27965 11.6833 2.75151 10.4327 2.73597 9.12391C2.72044 7.81509 3.21875 6.55236 4.12391 5.60688C5.02907 4.6614 6.26889 4.10856 7.57714 4.06707C8.8854 4.02559 10.1578 4.49877 11.121 5.385ZM18.349 11.192C18.8975 10.6395 19.2097 9.89545 19.2197 9.11701C19.2297 8.33857 18.9367 7.58673 18.4026 7.02032C17.8686 6.45391 17.1352 6.1173 16.3575 6.0816C15.5798 6.0459 14.8187 6.31391 14.235 6.829L14.107 6.949L12.692 8.364C12.5592 8.49619 12.3921 8.58855 12.2095 8.63062C12.0269 8.67268 11.8362 8.66277 11.659 8.602C11.5158 8.55271 11.3858 8.47129 11.279 8.364L9.863 6.95C9.31051 6.40153 8.56645 6.08931 7.78801 6.0793C7.00958 6.0693 6.25773 6.36228 5.69132 6.89637C5.12492 7.43045 4.7883 8.1638 4.7526 8.94148C4.7169 9.71916 4.98491 10.4803 5.5 11.064L5.621 11.192L7.036 12.607L11.998 17.582L16.932 12.609L18.349 11.192Z"></path>
                                                                            </svg>
                                                                        </span>
                                                                        Empathetic
                                                                    </li>
                                                                    <li
                                                                        onClick={() =>
                                                                            handleChangeTone(
                                                                                "Casual"
                                                                            )
                                                                        }
                                                                    >
                                                                        <svg
                                                                            width="22"
                                                                            height="22"
                                                                            fill="#44546F"
                                                                            viewBox="0 0 24 24"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            role="presentation"
                                                                        >
                                                                            <g clipPath="url(#clip0_11_3586)">
                                                                                <mask
                                                                                    id="mask0_11_3586"
                                                                                    maskUnits="userSpaceOnUse"
                                                                                    x="0"
                                                                                    y="0"
                                                                                    width="24"
                                                                                    height="24"
                                                                                >
                                                                                    <path
                                                                                        d="M0 0H24V24H0V0Z"
                                                                                        fill="white"
                                                                                    ></path>
                                                                                </mask>
                                                                                <g mask="url(#mask0_11_3586)">
                                                                                    <path
                                                                                        fillRule="evenodd"
                                                                                        clipRule="evenodd"
                                                                                        d="M12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 10.8181 3.23279 9.64778 3.68508 8.55585C4.13738 7.46392 4.80031 6.47177 5.63604 5.63604C6.47177 4.80031 7.46392 4.13738 8.55585 3.68508C9.64778 3.23279 10.8181 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12C21 14.3869 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.3869 21 12 21ZM12 19C13.3843 18.9996 14.7375 18.5889 15.8884 17.8196C17.0393 17.0504 17.9364 15.9572 18.4661 14.6782C18.9959 13.3993 19.1346 11.992 18.8648 10.6342C18.5949 9.27645 17.9286 8.02916 16.95 7.05C16.136 6.23608 15.1338 5.63546 14.0323 5.30135C12.9307 4.96723 11.7637 4.90994 10.6347 5.13453C9.50574 5.35913 8.44955 5.85868 7.55973 6.58895C6.6699 7.31922 5.9739 8.25766 5.53338 9.32115C5.09285 10.3846 4.92139 11.5404 5.03419 12.6859C5.14699 13.8315 5.54057 14.9316 6.18006 15.8888C6.81955 16.8459 7.68521 17.6306 8.70038 18.1733C9.71554 18.716 10.8489 18.9999 12 19ZM8.05 14.197C7.883 13.72 8.152 13.206 8.651 13.047C9.151 12.888 9.69 13.146 9.856 13.622C9.916 13.796 10.081 14.109 10.351 14.418C10.777 14.906 11.307 15.182 12 15.182C12.693 15.182 13.223 14.906 13.65 14.418C13.92 14.108 14.083 13.796 14.144 13.622C14.31 13.146 14.85 12.888 15.349 13.047C15.848 13.206 16.117 13.72 15.951 14.197C15.76 14.707 15.475 15.177 15.112 15.582C14.348 16.458 13.306 17 12 17C10.694 17 9.652 16.458 8.888 15.582C8.5247 15.1765 8.24017 14.7068 8.049 14.197H8.05ZM9.5 11C9.10218 11 8.72064 10.842 8.43934 10.5607C8.15804 10.2794 8 9.89782 8 9.5C8 9.10218 8.15804 8.72064 8.43934 8.43934C8.72064 8.15804 9.10218 8 9.5 8C9.89782 8 10.2794 8.15804 10.5607 8.43934C10.842 8.72064 11 9.10218 11 9.5C11 9.89782 10.842 10.2794 10.5607 10.5607C10.2794 10.842 9.89782 11 9.5 11ZM14.5 11C14.1022 11 13.7206 10.842 13.4393 10.5607C13.158 10.2794 13 9.89782 13 9.5C13 9.10218 13.158 8.72064 13.4393 8.43934C13.7206 8.15804 14.1022 8 14.5 8C14.8978 8 15.2794 8.15804 15.5607 8.43934C15.842 8.72064 16 9.10218 16 9.5C16 9.89782 15.842 10.2794 15.5607 10.5607C15.2794 10.842 14.8978 11 14.5 11Z"
                                                                                        fill="var(--ds-icon, #44546F)"
                                                                                    ></path>
                                                                                </g>
                                                                                <path
                                                                                    d="M5.503 8.957C5.503 8.55917 5.66103 8.17764 5.94234 7.89634C6.22364 7.61503 6.60517 7.457 7.003 7.457H9.826C10.0367 7.45714 10.2451 7.50168 10.4374 7.58772C10.6298 7.67377 10.8019 7.79938 10.9425 7.95637C11.083 8.11337 11.189 8.29822 11.2533 8.49888C11.3177 8.69955 11.339 8.91153 11.316 9.121L11.147 10.664C11.1066 11.0312 10.9321 11.3706 10.657 11.6171C10.3819 11.8637 10.0254 12 9.656 12H7.003C6.60517 12 6.22364 11.842 5.94234 11.5607C5.66103 11.2794 5.503 10.8978 5.503 10.5V8.957ZM12.678 9.013C12.6556 8.80375 12.6774 8.59213 12.7421 8.39188C12.8068 8.19163 12.9129 8.00723 13.0535 7.85066C13.1941 7.6941 13.3661 7.56888 13.5583 7.48314C13.7505 7.3974 13.9586 7.35306 14.169 7.353H16.979C17.3768 7.353 17.7584 7.51103 18.0397 7.79234C18.321 8.07364 18.479 8.45517 18.479 8.853V10.5C18.479 10.8978 18.321 11.2794 18.0397 11.5607C17.7584 11.842 17.3768 12 16.979 12H14.346C13.976 11.9999 13.619 11.863 13.3438 11.6156C13.0686 11.3683 12.8945 11.0279 12.855 10.66L12.678 9.013Z"
                                                                                    fill="var(--ds-icon, #44546F)"
                                                                                ></path>
                                                                                <path
                                                                                    d="M10.5 8H13.5V9.5H10.5V8Z"
                                                                                    fill="var(--ds-icon, #44546F)"
                                                                                ></path>
                                                                            </g>
                                                                            <defs>
                                                                                <clipPath id="clip0_11_3586">
                                                                                    <rect
                                                                                        width="24"
                                                                                        height="24"
                                                                                        fill="white"
                                                                                    ></rect>
                                                                                </clipPath>
                                                                            </defs>
                                                                        </svg>
                                                                        Casual
                                                                    </li>
                                                                    <li
                                                                        onClick={() =>
                                                                            handleChangeTone(
                                                                                "Neutral"
                                                                            )
                                                                        }
                                                                    >
                                                                        <svg
                                                                            width="22"
                                                                            height="22"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            role="presentation"
                                                                        >
                                                                            <path
                                                                                d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12Z"
                                                                                stroke="var(--ds-icon, #44546F)"
                                                                                strokeWidth="2"
                                                                            ></path>
                                                                            <path
                                                                                d="M11 9.5C11 8.67157 10.3284 8 9.5 8C8.67157 8 8 8.67157 8 9.5C8 10.3284 8.67157 11 9.5 11C10.3284 11 11 10.3284 11 9.5Z"
                                                                                fill="var(--ds-icon, #44546F)"
                                                                            ></path>
                                                                            <path
                                                                                d="M16 9.5C16 8.67157 15.3284 8 14.5 8C13.6716 8 13 8.67157 13 9.5C13 10.3284 13.6716 11 14.5 11C15.3284 11 16 10.3284 16 9.5Z"
                                                                                fill="var(--ds-icon, #44546F)"
                                                                            ></path>
                                                                            <path
                                                                                d="M15 13.5H9C8.44772 13.5 8 13.9477 8 14.5C8 15.0523 8.44772 15.5 9 15.5H15C15.5523 15.5 16 15.0523 16 14.5C16 13.9477 15.5523 13.5 15 13.5Z"
                                                                                fill="var(--ds-icon, #44546F)"
                                                                            ></path>
                                                                        </svg>
                                                                        Neutral
                                                                    </li>
                                                                    <li
                                                                        onClick={() =>
                                                                            handleChangeTone(
                                                                                "Education"
                                                                            )
                                                                        }
                                                                    >
                                                                        <svg
                                                                            width="22"
                                                                            height="22"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            role="presentation"
                                                                        >
                                                                            <path
                                                                                d="M18.636 15H7C6.46957 15 5.96086 15.2107 5.58579 15.5858C5.21071 15.9609 5 16.4696 5 17C5 17.5304 5.21071 18.0391 5.58579 18.4142C5.96086 18.7893 6.46957 19 7 19H19"
                                                                                stroke="var(--ds-icon, #44546F)"
                                                                                strokeWidth="2"
                                                                            ></path>
                                                                            <path
                                                                                d="M19 15V5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V17"
                                                                                stroke="var(--ds-icon, #44546F)"
                                                                                strokeWidth="2"
                                                                                strokeLinejoin="round"
                                                                            ></path>
                                                                            <path
                                                                                d="M19 19C18.4696 19 17.9609 18.7893 17.5858 18.4142C17.2107 18.0391 17 17.5304 17 17C17 16.4696 17.2107 15.9609 17.5858 15.5858C17.9609 15.2107 18.4696 15 19 15"
                                                                                stroke="var(--ds-icon, #44546F)"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                            ></path>
                                                                        </svg>
                                                                        Education
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {aiResponse && (
                                                            <>
                                                                <div
                                                                    className="res-content"
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: aiResponse,
                                                                    }}
                                                                ></div>
                                                                <div className="flex justify-end btn-container">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateDescriptionFromAIResponse(
                                                                                ACTION_UPDATE_DESCRIPTION.DISCARD
                                                                            )
                                                                        }
                                                                        className="btn btn-discart"
                                                                    >
                                                                        Discard
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateDescriptionFromAIResponse(
                                                                                ACTION_UPDATE_DESCRIPTION.INSERT
                                                                            )
                                                                        }
                                                                        className="btn btn-insert"
                                                                    >
                                                                        Insert
                                                                        below
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateDescriptionFromAIResponse(
                                                                                ACTION_UPDATE_DESCRIPTION.REPLACE
                                                                            )
                                                                        }
                                                                        className="btn btn-replace"
                                                                    >
                                                                        Replace
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="ip-container">
                                                            <input
                                                                className="input-ai"
                                                                type="text"
                                                                placeholder="Write content or select below"
                                                            />
                                                        </div>
                                                        <ul className="conatiner-option flex-1">
                                                            <h3 className="title">
                                                                <svg
                                                                    width="24"
                                                                    height="24"
                                                                    role="presentation"
                                                                    className="center"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        d="M14.5 14.5L17.5 17.5"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="square"
                                                                    ></path>
                                                                    <path
                                                                        d="M9.5 14.5L6.5 17.5"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="square"
                                                                    ></path>
                                                                    <path
                                                                        d="M9.5 9.5L6.5 6.5"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="square"
                                                                    ></path>
                                                                    <path
                                                                        d="M14.5 9.5L17.5 6.5"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="square"
                                                                    ></path>
                                                                    <path
                                                                        d="M12.0001 16V19"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                    ></path>
                                                                    <path
                                                                        d="M8.00012 12L5.00012 12"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                    ></path>
                                                                    <path
                                                                        d="M12.0001 8.00002L12.0001 4.99999"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                    ></path>
                                                                    <path
                                                                        d="M16.0002 12L19.0002 12"
                                                                        stroke="var(--ds-icon, #44546F)"
                                                                        strokeWidth="1.5"
                                                                    ></path>
                                                                </svg>{" "}
                                                                AI ASISSTANT
                                                            </h3>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.SUMMARY
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <div className="center">
                                                                    <svg
                                                                        width="24"
                                                                        height="24"
                                                                        viewBox="0 0 28 28"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        role="presentation"
                                                                    >
                                                                        <path
                                                                            d="M18 16.5H6C5.44772 16.5 5 16.9477 5 17.5C5 18.0523 5.44772 18.5 6 18.5H18C18.5523 18.5 19 18.0523 19 17.5C19 16.9477 18.5523 16.5 18 16.5Z"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                        ></path>
                                                                        <path
                                                                            d="M18 6.5H14C13.4477 6.5 13 6.94772 13 7.5C13 8.05228 13.4477 8.5 14 8.5H18C18.5523 8.5 19 8.05228 19 7.5C19 6.94772 18.5523 6.5 18 6.5Z"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                        ></path>
                                                                        <path
                                                                            d="M18 11.5H6C5.44772 11.5 5 11.9477 5 12.5C5 13.0523 5.44772 13.5 6 13.5H18C18.5523 13.5 19 13.0523 19 12.5C19 11.9477 18.5523 11.5 18 11.5Z"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                        ></path>
                                                                        <path
                                                                            d="M5.375 7.661C5.375 8.14424 5.76675 8.536 6.25 8.536C6.73325 8.536 7.125 8.14424 7.125 7.661C7.125 7.17775 6.73325 6.786 6.25 6.786C5.76675 6.786 5.375 7.17775 5.375 7.661Z"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                            stroke="var(--ds-icon, #44546F)"
                                                                            strokeWidth="1.75"
                                                                        ></path>
                                                                        <path
                                                                            d="M9.375 7.661C9.375 8.14424 9.76675 8.536 10.25 8.536C10.7332 8.536 11.125 8.14424 11.125 7.661C11.125 7.17775 10.7332 6.786 10.25 6.786C9.76675 6.786 9.375 7.17775 9.375 7.661Z"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                            stroke="var(--ds-icon, #44546F)"
                                                                            strokeWidth="1.75"
                                                                        ></path>
                                                                        <path
                                                                            d="M5.07 7.989C4.682 6.493 5.481 5.164 6.77 4.955M9.07 7.989C8.682 6.493 9.481 5.164 10.77 4.955"
                                                                            fill="var(--ds-icon, #44546F)"
                                                                            strokeLinecap="round"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                                <Ink></Ink>
                                                                Summary of the
                                                                article
                                                            </li>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.IMPROVE_WRITING
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <div className="center">
                                                                    <span
                                                                        data-vc="icon-undefined"
                                                                        aria-hidden="true"
                                                                        className="svg"
                                                                    >
                                                                        <svg
                                                                            width="20"
                                                                            height="20"
                                                                            viewBox="0 0 28 28"
                                                                            className="center"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <path d="M8.45366 7.76225L6.37618 5.68477C6.16881 5.4774 5.8326 5.4774 5.62524 5.68477L5.62453 5.68548C5.41716 5.89284 5.41716 6.22906 5.62453 6.43642L7.70201 8.5139C7.90938 8.72127 8.24559 8.72127 8.45296 8.5139L8.45366 8.5132C8.66103 8.30583 8.66103 7.96962 8.45366 7.76225Z"></path>
                                                                            <path d="M17.6911 5.69892L15.5853 7.80468C15.3858 8.00424 15.3858 8.32779 15.5853 8.52735C15.7849 8.7269 16.1084 8.7269 16.308 8.52735L18.4138 6.42158C18.6133 6.22203 18.6133 5.89848 18.4138 5.69892C18.2142 5.49936 17.8907 5.49936 17.6911 5.69892Z"></path>
                                                                            <path d="M7.64164 15.6144L5.58538 17.6706C5.37215 17.8838 5.37215 18.2296 5.58538 18.4428L5.58608 18.4435C5.79931 18.6567 6.14502 18.6567 6.35824 18.4435L8.41451 16.3872C8.62774 16.174 8.62774 15.8283 8.41451 15.6151L8.4138 15.6144C8.20058 15.4011 7.85487 15.4011 7.64164 15.6144Z"></path>
                                                                            <path d="M6.5 11.5H3.5C3.22386 11.5 3 11.7239 3 12C3 12.2761 3.22386 12.5 3.5 12.5H6.5C6.77614 12.5 7 12.2761 7 12C7 11.7239 6.77614 11.5 6.5 11.5Z"></path>
                                                                            <path d="M20.5 11.5H17.5C17.2239 11.5 17 11.7239 17 12C17 12.2761 17.2239 12.5 17.5 12.5H20.5C20.7761 12.5 21 12.2761 21 12C21 11.7239 20.7761 11.5 20.5 11.5Z"></path>
                                                                            <path d="M12.5 6.5V3.5C12.5 3.22386 12.2761 3 12 3C11.7239 3 11.5 3.22386 11.5 3.5V6.5C11.5 6.77614 11.7239 7 12 7C12.2761 7 12.5 6.77614 12.5 6.5Z"></path>
                                                                            <path d="M12.5 20.5V17.5C12.5 17.2239 12.2761 17 12 17C11.7239 17 11.5 17.2239 11.5 17.5V20.5C11.5 20.7761 11.7239 21 12 21C12.2761 21 12.5 20.7761 12.5 20.5Z"></path>
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M13.62 12.913L11.854 11.146C11.7602 11.0521 11.633 10.9993 11.5004 10.9992C11.3677 10.9991 11.2404 11.0517 11.1465 11.1455C11.0526 11.2392 10.9998 11.3665 10.9997 11.4991C10.9996 11.6318 11.0522 11.7591 11.146 11.853L12.913 13.62L13.62 12.913ZM12.56 10.439C12.277 10.1659 11.898 10.0149 11.5047 10.0185C11.1114 10.0221 10.7353 10.18 10.4573 10.4582C10.1793 10.7365 10.0217 11.1128 10.0185 11.5061C10.0153 11.8994 10.1666 12.2782 10.44 12.561L17.51 19.631C17.6483 19.7743 17.8138 19.8887 17.9967 19.9674C18.1797 20.0461 18.3765 20.0875 18.5757 20.0894C18.7748 20.0912 18.9724 20.0533 19.1568 19.978C19.3411 19.9027 19.5087 19.7914 19.6496 19.6506C19.7905 19.5098 19.9019 19.3424 19.9774 19.1581C20.053 18.9738 20.091 18.7763 20.0894 18.5771C20.0877 18.3779 20.0464 18.1811 19.9679 17.998C19.8894 17.815 19.7752 17.6494 19.632 17.511L12.56 10.439Z"
                                                                            ></path>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <Ink></Ink>
                                                                Improve writing
                                                            </li>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.FIX_ERRORS
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <div className="center svg">
                                                                    <span
                                                                        data-vc="icon-undefined"
                                                                        aria-hidden="true"
                                                                    >
                                                                        <svg
                                                                            width="20"
                                                                            height="20"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            className="center"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            role="presentation"
                                                                        >
                                                                            <path
                                                                                d="M12 4C12.676 4 13.284 4.399 13.556 5.008L13.609 5.142L16.944 14.67C17.0283 14.9108 17.0173 15.1748 16.9134 15.4078C16.8094 15.6408 16.6203 15.8252 16.3848 15.9234C16.1493 16.0215 15.8851 16.0259 15.6465 15.9357C15.4078 15.8455 15.2127 15.6674 15.101 15.438L15.056 15.33L14.232 12.973L14.117 12.993L14 13H10C9.92255 12.9999 9.84536 12.9909 9.77 12.973L8.944 15.33C8.86313 15.5614 8.70011 15.755 8.4859 15.8741C8.27169 15.9932 8.0212 16.0294 7.782 15.976L7.67 15.944C7.43863 15.8631 7.24502 15.7001 7.12593 15.4859C7.00684 15.2717 6.97057 15.0212 7.024 14.782L7.056 14.67L10.391 5.142C10.5078 4.80818 10.7255 4.51893 11.0139 4.31432C11.3024 4.10971 11.6473 3.99987 12.001 4H12ZM12 6.598L10.46 11H13.542L12.002 6.598H12Z"
                                                                                fill="var(--ds-icon, #44546F)"
                                                                            ></path>
                                                                            <path
                                                                                d="M14 17L16 19L20 15"
                                                                                stroke="var(--ds-icon, #44546F)"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            ></path>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <Ink></Ink>
                                                                Fix spelling and
                                                                language errors
                                                            </li>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.GENERATE_IDEA
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <div className="svg">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        className="center"
                                                                        viewBox="0 0 28 28"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        role="presentation"
                                                                    >
                                                                        <path d="M7.04101 4.052C8.35608 2.73768 10.1392 1.99937 11.9985 1.99937C13.8578 1.99937 15.6409 2.73768 16.956 4.052C17.581 4.67653 18.0768 5.4181 18.415 6.23433C18.7533 7.05056 18.9274 7.92545 18.9274 8.809C18.9274 9.69254 18.7533 10.5674 18.415 11.3837C18.0768 12.1999 17.581 12.9415 16.956 13.566L16.841 13.678L16.724 13.787L15.998 14.446L16 15.83L15.998 15.862V18.001C15.9976 18.7657 15.7051 19.5014 15.1804 20.0577C14.6557 20.6139 13.9384 20.9489 13.175 20.994L12.998 20.999H10.998C10.2333 20.9988 9.49752 20.7066 8.94104 20.1821C8.38455 19.6576 8.04938 18.9404 8.00401 18.177L7.99801 18.001V14.445L7.27301 13.785C6.01548 12.6426 5.23697 11.0665 5.09394 9.37352C4.95091 7.68057 5.45397 5.99622 6.50201 4.659L6.66401 4.46L6.82001 4.283C6.89182 4.20392 6.96551 4.12756 7.04101 4.052ZM13.998 16.83H9.99801V18.002C9.99831 18.2469 10.0885 18.4832 10.2514 18.666C10.4144 18.8489 10.6387 18.9656 10.882 18.994L10.998 19.001H12.998C13.2431 19.0012 13.4798 18.9114 13.663 18.7486C13.8462 18.5858 13.9633 18.3614 13.992 18.118L13.998 18.002V16.83ZM15.54 5.466C15.0613 4.98771 14.4907 4.61131 13.8626 4.3595C13.2345 4.10769 12.5619 3.98567 11.8854 4.00081C11.2089 4.01595 10.5424 4.16792 9.92623 4.44758C9.31003 4.72724 8.75684 5.12878 8.30001 5.628C7.48334 6.52552 7.04311 7.70273 7.07048 8.91589C7.09784 10.129 7.5907 11.2852 8.44701 12.145L8.61701 12.308L9.67001 13.264C9.84765 13.4255 9.96123 13.6456 9.99001 13.884L9.99701 14.004V14.831H13.997V14.004C13.9971 13.7638 14.0838 13.5316 14.241 13.35L14.325 13.264L15.46 12.231L15.54 12.153C15.9793 11.714 16.3277 11.1928 16.5654 10.6191C16.8032 10.0454 16.9255 9.43049 16.9255 8.80949C16.9255 8.1885 16.8032 7.57358 16.5654 6.99989C16.3277 6.4262 15.9793 5.90497 15.54 5.466Z"></path>
                                                                    </svg>
                                                                </div>
                                                                <Ink></Ink>
                                                                Generate an idea
                                                            </li>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.SHORTEN
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <div className="center svg">
                                                                    <svg
                                                                        width="20"
                                                                        height="20"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        role="presentation"
                                                                    >
                                                                        <path d="M11 13H7C6.44772 13 6 13.4477 6 14C6 14.5523 6.44772 15 7 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13Z"></path>
                                                                        <path d="M17 9H7C6.44772 9 6 9.44772 6 10C6 10.5523 6.44772 11 7 11H17C17.5523 11 18 10.5523 18 10C18 9.44772 17.5523 9 17 9Z"></path>
                                                                    </svg>
                                                                </div>
                                                                <Ink></Ink>
                                                                Shorten
                                                            </li>
                                                            <li
                                                                onClick={() =>
                                                                    handleCallAI(
                                                                        ACTION_AI.CHANGE_TONE
                                                                    )
                                                                }
                                                                className="op-item"
                                                            >
                                                                <span className="center">
                                                                    <svg
                                                                        fill="none"
                                                                        width={
                                                                            20
                                                                        }
                                                                        height={
                                                                            20
                                                                        }
                                                                        viewBox="0 0 20 20"
                                                                        className="center"
                                                                    >
                                                                        <path
                                                                            stroke="currentcolor"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="1.5"
                                                                            d="M13.25 7c0 2.9-2.35 5.25-5.25 5.25m0 0A5.25 5.25 0 0 1 2.75 7M8 12.25v3m0 0h4m-4 0H4M10.25 7a2.25 2.25 0 0 1-4.5 0V3a2.25 2.25 0 0 1 4.5 0z"
                                                                        ></path>
                                                                    </svg>
                                                                </span>
                                                                <Ink></Ink>
                                                                Change the tone
                                                            </li>
                                                        </ul>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <ReactQuill
                                            className="w-full"
                                            theme="snow"
                                            value={description || ""}
                                            placeholder="Ask a question"
                                            onChange={(
                                                content,
                                                delta,
                                                source,
                                                editor
                                            ) => {
                                                setDescription(content);
                                            }}
                                            modules={toolbar}
                                            formats={formats}
                                        ></ReactQuill>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        className="res-content"
                                        dangerouslySetInnerHTML={{
                                            __html: description,
                                        }}
                                    ></div>
                                </>
                            )}
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <AccessTimeIcon
                                style={{ marginRight: "15px", color: "black" }}
                            />
                            <Typography>Activity</Typography>
                        </Box>
                        {comments.length > 0 &&
                            comments.map((comment, index) => (
                                <Box
                                    sx={{ display: "flex", mb: 2 }}
                                    key={index}
                                >
                                    <Avatar
                                        src={comment.user.avatar}
                                        sx={{ width: 28, height: 28, mr: 1 }}
                                    />
                                    <Box>
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {comment.user.name}
                                        </Typography>
                                        <Typography>
                                            {comment.content}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontSize: "0.8rem",
                                                color: "#666",
                                            }}
                                        >
                                            {new Date(
                                                comment.timestamp
                                            ).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <Avatar
                                sx={{ width: 28, height: 28, mr: 1 }}
                                src={user ? user.avatar : ""}
                            />

                            <InputBase
                                sx={{
                                    border: "1px solid #ccc",
                                    borderRadius: "15px",
                                    padding: "4px 8px",
                                    flex: 1,
                                }}
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={handleCommentChange}
                                onKeyPress={handleCommentKeyPress}
                            />
                        </Box>
                    </Box>
                    <CardInformationRightPane
                        handleCoverButtonClick={handleCoverButtonClick}
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleCoverImageChange}
                        accept="image/*"
                    />
                </Box>
            </Modal>
        </div>
    );
};

export default CardInformation;

const toolbar = {
    toolbar: {
        container: [
            [{ header: "1" }, { header: "2" }],
            [{ size: [] }],
            ["bold", "italic", "underline", "strike"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link", "image"],
            ["clean"],
            ["code-block"],
        ],
    },
    clipboard: {
        matchVisual: false,
    },
};

const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "imageBlot",
    "code-block",
];
