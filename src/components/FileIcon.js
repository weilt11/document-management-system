import React from 'react';

const FileIcon = ({ type, size = 16 }) => {
  const getIcon = () => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('text')) return '📝';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <span style={{ fontSize: size }}>
      {getIcon()}
    </span>
  );
};

export default FileIcon;