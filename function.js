window.uploadFileToOpenAI = async function(api_key, file_url, purpose) {
    if (!api_key.value) return "Error: OpenAI API Key is required.";
    if (!file_url.value) return "Error: File URL is required.";

    try {
        // SET VARIABLES
        const OPENAI_API_KEY = api_key.value;
        const fileUrl = file_url.value.trim();
        const uploadPurpose = purpose?.value || "assistants"; // Default to "assistants"

        // FETCH FILE AS BLOB
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from ${fileUrl}: ${response.statusText}`);
        }
        const blob = await response.blob();

        // GET ORIGINAL FILE NAME FROM URL
        const fileName = fileUrl.split("/").pop().split("?")[0]; // Extract filename from URL
        const fileExtension = fileName.split('.').pop().toLowerCase();

        // LIST OF ALLOWED FILE TYPES BASED ON PURPOSE
        const allowedFileTypes = {
            "assistants": ["txt", "json", "csv", "tsv", "md", "pdf", "docx", "pptx"], // Vector store
            "vision": ["jpg", "jpeg", "png", "webp", "gif"] // Vision API
        };

        // CHECK IF FILE TYPE IS SUPPORTED FOR THE SELECTED PURPOSE
        if (!allowedFileTypes[uploadPurpose] || !allowedFileTypes[uploadPurpose].includes(fileExtension)) {
            throw new Error(`Unsupported file type: .${fileExtension} for purpose: ${uploadPurpose}. Allowed types: ${allowedFileTypes[uploadPurpose]?.join(", ") || "None"}`);
        }

        // CREATE FILE OBJECT PRESERVING MIME TYPE
        const file = new File([blob], fileName, { type: blob.type });

        // CREATE FORM DATA
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", uploadPurpose);

        // UPLOAD TO OPENAI
        const uploadResponse = await fetch("https://api.openai.com/v1/files", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || "Unknown error"}`);
        }

        // RETURN UPLOAD RESPONSE
        const result = await uploadResponse.json();
        return JSON.stringify(result, null, 2);

    } catch (error) {
        // RETURN ERROR
        return `Error: ${error.message}`;
    }
};
