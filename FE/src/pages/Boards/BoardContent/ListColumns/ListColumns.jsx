import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Column from "./Column/Column";
import Button from "@mui/material/Button";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";

function ListColumns({
    board,
    columns,
    createNewColumn,
    createNewCard,
    selectedImage,
    deleteColumnDetails,
    updateColumnTitle,
}) {
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
    const toggleOpenNewColumnForm = () =>
        setOpenNewColumnForm(!openNewColumnForm);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const addNewColumn = () => {
        if (!newColumnTitle) {
            console.log("Please enter Column Title");
            return;
        }

        const newColumnData = {
            title: newColumnTitle,
        };
        createNewColumn(newColumnData);

        toggleOpenNewColumnForm();
        setNewColumnTitle("");
    };
    const c =
        "<div><h1>Ý tưởng cho quản lý công việc làm một chiếc xe đạp từ gỗ</h1><ul><li><p><strong>Lên kế hoạch thiết kế</strong>: Vẽ phác thảo chi tiết của chiếc xe đạp, bao gồm khung xe, bánh xe, tay lái, và các bộ phận khác.</p></li><li><p><strong>Chọn loại gỗ phù hợp</strong>: Tìm hiểu và lựa chọn loại gỗ có độ bền cao, nhẹ và dễ gia công như gỗ sồi, gỗ thông.</p></li><li><p><strong>Chuẩn bị công cụ và vật liệu</strong>: Đảm bảo có đầy đủ các dụng cụ cần thiết như cưa, bào, đục, và keo dán gỗ.</p></li><li><p><strong>Gia công các bộ phận</strong>: Cắt và gia công từng bộ phận của xe đạp theo thiết kế đã lên kế hoạch.</p></li><li><p><strong>Lắp ráp khung xe</strong>: Sử dụng keo dán và đinh để lắp ráp khung xe chắc chắn.</p></li><li><p><strong>Tạo bánh xe</strong>: Làm và lắp ráp bánh xe gỗ với trục và vòng bi để đảm bảo chuyển động mượt mà.</p></li><li><p><strong>Lắp đặt tay lái và yên xe</strong>: Đảm bảo tay lái và yên xe được lắp đúng vị trí và chắc chắn.</p></li><li><p><strong>Kiểm tra và hoàn thiện</strong>: Kiểm tra toàn bộ chiếc xe để đảm bảo không có lỗi kỹ thuật, sau đó hoàn thiện bằng cách sơn hoặc phủ lớp bảo vệ gỗ.</p></li><li><p><strong>Thử nghiệm và điều chỉnh</strong>: Thử nghiệm xe đạp để kiểm tra độ an toàn và thực hiện các điều chỉnh cần thiết.</p></li><li><p><strong>Bảo quản và bảo dưỡng</strong>: Hướng dẫn cách bảo quản và bảo dưỡng xe đạp gỗ để kéo dài tuổi thọ.</p></li></ul></div>";
    const c1 =
        "Đây là tiêu đề\n\n1. Triển khai 1\n2. Triển khai 2\n3.  Triển khai 4\n\n`html code`";
    return (
        <div>
            <SortableContext
                items={columns?.map((c) => c._id)}
                strategy={horizontalListSortingStrategy}
            >
                <Box
                    sx={{
                        backgroundImage: selectedImage
                            ? `url(${selectedImage})`
                            : "none",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        overflowX: "auto",
                        overflowY: "hidden",
                        "&::-webkit-scrollbar-track": { m: 2 },
                    }}
                >
                    {columns?.map((column) => (
                        <Column
                            board={board}
                            key={column._id}
                            column={column}
                            createNewCard={createNewCard}
                            updateColumnTitle={updateColumnTitle}
                            deleteColumnDetails={deleteColumnDetails}
                        />
                    ))}

                    {/* Add new col */}
                    {!openNewColumnForm ? (
                        <Box
                            onClick={toggleOpenNewColumnForm}
                            sx={{
                                minWidth: "250px",
                                maxWidth: "250px",
                                mx: 2,
                                borderRadius: "6px",
                                height: "fit-content",
                                bgcolor: "#ffffff3d ",
                            }}
                        >
                            <Button
                                startIcon={<NoteAddIcon />}
                                sx={{
                                    color: "white",
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    pl: 2.5,
                                    py: 1,
                                }}
                            >
                                Add New Column
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                minWidth: "250px",
                                maxWidth: "250px",
                                mx: 2,
                                p: 1,
                                borderRadius: "6px",
                                height: "fit-content",
                                bgcolor: "#ffffff3d",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                            }}
                        >
                            <TextField
                                label="Enter card title..."
                                type="text"
                                size="small"
                                variant="outlined"
                                autoFocus
                                value={newColumnTitle}
                                onChange={(e) =>
                                    setNewColumnTitle(e.target.value)
                                }
                                sx={{
                                    "& label": { color: "white" },
                                    "& input": { color: "white" },
                                    "& label.Mui-focused ": { color: "white" },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": { borderColor: "white" },
                                        "&:hover fieldset": {
                                            borderColor: "white",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "white",
                                        },
                                    },
                                }}
                            />
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                <Button
                                    onClick={addNewColumn}
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    sx={{
                                        boxShadow: "none",
                                        border: "0.5px solid",
                                        borderColor: (theme) =>
                                            theme.palette.success.main,
                                        "&:hover": {
                                            bgcolor: (theme) =>
                                                theme.palette.success.main,
                                        },
                                    }}
                                >
                                    Add Column{" "}
                                </Button>
                                <CloseIcon
                                    fontSize="small"
                                    sx={{
                                        color: "white",
                                        cursor: "pointer",
                                        "&:hover": {
                                            color: (theme) =>
                                                theme.palette.warning.light,
                                        },
                                    }}
                                    onClick={toggleOpenNewColumnForm}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </SortableContext>
        </div>
    );
}

export default ListColumns;
