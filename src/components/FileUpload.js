import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FileUpload = ({ onUploadSuccess, accept, multiple = false }) => {
  const handleUpload = (file) => {
    // 这里可以添加文件类型和大小验证
    const isAcceptable = accept ? accept.split(',').some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    }) : true;

    if (!isAcceptable) {
      message.error('不支持的文件类型');
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('文件大小不能超过5MB');
      return false;
    }

    onUploadSuccess(file);
    return false; // 阻止默认上传
  };

  const uploadProps = {
    beforeUpload: handleUpload,
    showUploadList: false,
    accept,
    multiple
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />}>选择文件</Button>
    </Upload>
  );
};

export default FileUpload;