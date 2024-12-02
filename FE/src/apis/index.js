import { South } from "@mui/icons-material";
import axios from "axios";
import { API_ROOT, API_AI, TOKEN_AUTHENTICATION } from "~/utils/constans";

const body = {
    conversation_id: "31223",
    bot_id: "7443492050768986113",
    user: "demo",
    stream: true,
};
const exQuery = `tôi muốn lên ý quản lý công việc về ..., với nội dung mô tả là ..., hoàn thiện và đày đủ nhất có thể, lên kế hoạch chi tiết, mở rộnag thêm`;

export const postActionToAI = async (action, content) => {
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

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let tempContent = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const events = chunk.split("\n\n");

            for (const event of events) {
                if (event.startsWith("data:")) {
                    const jsonStr = event.replace("data:", "").trim();
                    try {
                        const json = JSON.parse(jsonStr);
                        if (json.event === "message" && json.message?.content) {
                            tempContent += json.message.content;
                            console.log(tempContent); // Hiển thị dữ liệu.
                        }
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                    }
                }
            }
        }

        return tempContent; // Kết quả cuối cùng.
    } catch (error) {
        console.error(
            "There has been a problem with your fetch operation:",
            error
        );
        return Promise.reject(error);
    }
};

export const getBoardFromAI = async (title, description) => {
    const body = {
        conversation_id: "31223",
        bot_id: "7441988040979496976",
        user: "demo",
        query: `tôi muốn lên ý quản lý công việc về ${title}, với nội dung mô tả là ${description}, hoàn thiện và đày đủ nhất có thể, lên kế hoạch chi tiết, mở rộnag thêm`,
        stream: false,
    };
    try {
        const res = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN_AUTHENTICATION}`,
            },
        });
        console.log(res);
        const rawJson = res.data.messages[0].content
            .replace(/```json|```/g, "")
            .trim();
        return rawJson;
    } catch (error) {
        console.error(
            "There has been a problem with your fetch operation:",
            error
        );
        return Promise.reject(error);
    }
};
// user
export const loginAPI = async (credentials) => {
    try {
        // Gửi yêu cầu POST đến endpoint đăng nhập của máy chủ API với thông tin đăng nhập
        const response = await axios.post(
            `${API_ROOT}/v1/Users/login`,
            credentials
        );

        return response.data; // Trả về dữ liệu từ phản hồi của máy chủ API
    } catch (error) {
        throw error; // Xử lý lỗi nếu có
    }
};
export const signupAPI = async (userData) => {
    try {
        const response = await axios.post(`${API_ROOT}/v1/Users/`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserBoardsAPI = async (ownerIds) => {
    try {
        const response = await axios.get(
            `${API_ROOT}/v1/boards/users/${ownerIds}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUserInfoAPI = async (userId) => {
    try {
        const response = await axios.get(`${API_ROOT}/v1/Users/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateUserInfoAPI = async (userId, updateData) => {
    try {
        const response = await axios.put(
            `${API_ROOT}/v1/Users/${userId}`,
            updateData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchInforUserBoardsAPI = async (ownerIds) => {
    try {
        const response = await axios.get(
            `${API_ROOT}/v1/boards/${ownerIds}/members`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
//Boards
export const fetchAllBoardsAPI = async () => {
    const response = await axios.get(`${API_ROOT}/v1/boards`);
    return response.data;
};
export const fetchBoardDetailsAPI = async (boardId) => {
    const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);

    return response.data;
};
export const updateBoardDetailsAPI = async (boardId, updateData) => {
    const response = await axios.put(
        `${API_ROOT}/v1/boards/${boardId}`,
        updateData
    );

    return response.data;
};
export const moveCardToDifferentColumnAPI = async (updateData) => {
    const response = await axios.put(
        `${API_ROOT}/v1/boards/supports/moving_cards`,
        updateData
    );

    return response.data;
};

export const createNewBoardAPI = async (newBoardData) => {
    const response = await axios.post(`${API_ROOT}/v1/boards`, newBoardData);
    return response.data;
};

export const deleteBoardDetailsAPI = async (boardId) => {
    const response = await axios.delete(`${API_ROOT}/v1/boards/${boardId}`);
    return response.data;
};

//Columns
export const createNewColumnAPI = async (newColumnData) => {
    const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData);

    return response.data;
};
export const updatecolumnDetailsAPI = async (columnId, updateData) => {
    const response = await axios.put(
        `${API_ROOT}/v1/columns/${columnId}`,
        updateData
    );

    return response.data;
};
export const deleteColumnDetailsAPI = async (columnId) => {
    const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`);

    return response.data;
};
//Cards
export const createNewCardAPI = async (newCardData) => {
    const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData);

    return response.data;
};
export const updateCardDetailsAPI = async (cardId, updatedFields) => {
    try {
        const response = await axios.put(
            `${API_ROOT}/v1/cards/${cardId}`,
            updatedFields
        );
        return response.data;
    } catch (error) {
        console.error("Failed to update card details:", error);
        throw error;
    }
};
export const addMemberToCardAPI = async (cardId, memberId) => {
    try {
        const response = await axios.post(
            `${API_ROOT}/v1/cards/${cardId}/members`,
            { memberId }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// invitation
export const fetchInvitationsAPI = async (invitedUserId) => {
    try {
        const response = await axios.get(
            `${API_ROOT}/v1/Invitation/invited/${invitedUserId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const sendInvitationAPI = async (invitationData) => {
    try {
        const response = await axios.post(
            `${API_ROOT}/v1/Invitation`,
            invitationData
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const acceptInvitationAPI = async (invitationId) => {
    try {
        const response = await axios.patch(
            `${API_ROOT}/v1/Invitation/${invitationId}/accept`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const declineInvitationAPI = async (invitationId) => {
    try {
        const response = await axios.patch(
            `${API_ROOT}/v1/Invitation/${invitationId}/decline`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
