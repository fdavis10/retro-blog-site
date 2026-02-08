import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link'
  ];

  return (
    <div className="rich-text-editor" style={{ borderRadius: '0' }}>
      <style>{`
        .rich-text-editor .ql-container {
          border-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
        .rich-text-editor .ql-toolbar {
          border-radius: 0 !important;
          border-top-left-radius: 0 !important;
          border-top-right-radius: 0 !important;
          border: 1px solid var(--fb-border);
          border-bottom: none;
        }
        .rich-text-editor .ql-container {
          border: 1px solid var(--fb-border);
          border-top: none;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Напишите что-нибудь...'}
        style={{ 
          backgroundColor: 'white',
          borderRadius: '0',
          minHeight: '200px'
        }}
      />
    </div>
  );
};

export default RichTextEditor;