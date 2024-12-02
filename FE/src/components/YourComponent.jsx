import React from 'react';
import 'react-quill/dist/quill.snow.css'; // Ensure this CSS is imported

const YourComponent = ({ htmlContent }) => {
    return (
        <div
            className="quill-content custom-quill" // Add a custom class to apply Quill styles
            dangerouslySetInnerHTML={{
                __html: htmlContent,
            }}
        />
    );
};

export default YourComponent;