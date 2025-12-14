import React, { useState, useEffect } from 'react';
import {
  Table, Button, Upload, message, Space, Modal,
  Form, Input, Card, Progress, Tag, Row, Col,
  Statistic, Tooltip, Dropdown
} from 'antd';
import {
  UploadOutlined, DeleteOutlined, DownloadOutlined,
  EyeOutlined, FileTextOutlined, MoreOutlined,
  EditOutlined, FolderOpenOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../services/AuthService';
import DocumentService from '../services/DocumentService';

const DocumentManagement = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingDoc, setRenamingDoc] = useState(null);
  const [renameForm] = Form.useForm();
  const [stats, setStats] = useState({ totalCount: 0, totalSize: 0, recentUploads: [] });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    setLoading(true);
    try {
      const userDocuments = DocumentService.getUserDocuments(currentUser.id);
      setDocuments(userDocuments);
      
      // 更新统计信息
      const documentStats = DocumentService.getDocumentStats(currentUser.id);
      setStats(documentStats);
    } catch (error) {
      message.error('加载文档失败');
      console.error('加载文档错误:', error);
    }
    setLoading(false);
  };

  // 修复：改进文件上传处理
  const handleUpload = (info) => {
    const { file } = info;
    
    console.log('开始上传文件:', file.name, file.size, file.type);
    
    // 检查文件大小
    if (file.size > DocumentService.maxFileSize) {
      message.error(`文件大小不能超过 ${DocumentService.maxFileSize / 1024 / 1024}MB`);
      return false;
    }

    setUploading(true);
    setUploadProgress(0);

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // 实际处理文件上传
    DocumentService.uploadDocument(file, currentUser)
      .then((newDocument) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        message.success(`${file.name} 上传成功`);
        console.log('文件上传成功:', newDocument);
        loadDocuments();
        
        // 重置上传状态
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 500);
      })
      .catch(error => {
        clearInterval(progressInterval);
        console.error('文件上传失败:', error);
        message.error(error.message || '文件上传失败');
        setUploading(false);
        setUploadProgress(0);
      });

    return false; // 阻止默认上传行为
  };

  // 修复：添加自定义上传按钮点击处理
  const handleUploadButtonClick = () => {
    // 创建一个隐藏的input元素来触发文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Object.keys(DocumentService.getSupportedFileTypes()).join(',');
    input.multiple = true;
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        files.forEach(file => {
          handleUpload({ file });
        });
      }
      // 清理
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  };

  // 处理删除文档
  const handleDelete = (document) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文档 "${document.name}" 吗？此操作不可恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        const result = DocumentService.deleteDocument(document.id, currentUser);
        if (result.success) {
          message.success('文档删除成功');
          loadDocuments();
        } else {
          message.error(result.message);
        }
      }
    });
  };

  // 处理下载文档
  const handleDownload = (document) => {
    const result = DocumentService.downloadDocument(document.id, currentUser);
    if (!result.success) {
      message.error(result.message);
    }
  };

  // 处理预览文档
  const handlePreview = (document) => {
    const result = DocumentService.previewDocument(document.id, currentUser);
    if (result.success) {
      setPreviewDocument(result.document);
      setPreviewVisible(true);
    } else {
      message.error(result.message);
    }
  };

  // 处理重命名文档
  const handleRename = (document) => {
    setRenamingDoc(document);
    renameForm.setFieldsValue({ newName: document.name });
    setRenameModalVisible(true);
  };

  const confirmRename = () => {
    renameForm.validateFields().then(values => {
      const result = DocumentService.renameDocument(renamingDoc.id, values.newName, currentUser);
      if (result.success) {
        message.success('重命名成功');
        setRenameModalVisible(false);
        loadDocuments();
      } else {
        message.error(result.message);
      }
    });
  };

  // 更多操作菜单
  const getActionMenu = (document) => ({
    items: [
      {
        key: 'preview',
        icon: <EyeOutlined />,
        label: '预览',
        onClick: () => handlePreview(document),
      },
      {
        key: 'download',
        icon: <DownloadOutlined />,
        label: '下载',
        onClick: () => handleDownload(document),
      },
      {
        key: 'rename',
        icon: <EditOutlined />,
        label: '重命名',
        onClick: () => handleRename(document),
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => handleDelete(document),
      },
    ],
  });

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ fontSize: '16px' }}>
            {DocumentService.getFileIcon(record.type)}
          </span>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {new Date(record.uploadTime).toLocaleDateString()} 上传
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">
          {DocumentService.getFileTypeName(type)}
        </Tag>
      )
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size) => DocumentService.formatFileSize(size)
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
              disabled={!record.type.startsWith('image/') && !record.type.includes('pdf')}
            />
          </Tooltip>
          <Tooltip title="下载">
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Dropdown menu={getActionMenu(record)} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 修复：使用自定义按钮而不是Upload组件
  const uploadProps = {
    beforeUpload: () => false, // 完全禁用默认上传
    showUploadList: false,
    accept: Object.keys(DocumentService.getSupportedFileTypes()).join(','),
    multiple: true
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 统计信息卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={stats.totalCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总存储空间"
              value={DocumentService.formatFileSize(stats.totalSize)}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>最近上传</span>
              <Tooltip title="支持图片、PDF、Word、Excel、文本文件，最大10MB">
                <InfoCircleOutlined />
              </Tooltip>
            </div>
            <div style={{ marginTop: 8 }}>
              {stats.recentUploads.length > 0 ? (
                stats.recentUploads.map(doc => (
                  <Tag key={doc.id} style={{ marginBottom: 4 }}>
                    {DocumentService.getFileIcon(doc.type)} {doc.name}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#999' }}>暂无最近上传文档</span>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 文档管理卡片 */}
      <Card 
        title="文档管理" 
        bordered={false}
        extra={
          <Space>
            {/* 修复：使用自定义按钮而不是Upload组件 */}
            <Button 
              type="primary" 
              icon={<UploadOutlined />} 
              loading={uploading}
              disabled={uploading}
              onClick={handleUploadButtonClick}
            >
              上传文档
            </Button>
          </Space>
        }
      >
        {uploading && (
          <div style={{ marginBottom: 16 }}>
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress === 100 ? 'success' : 'active'}
              size="small" 
            />
            <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
              正在上传文件...
            </div>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条文档`
          }}
          locale={{
            emptyText: (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
                <div style={{ color: '#999' }}>暂无文档，请上传您的第一个文档</div>
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />} 
                  style={{ marginTop: 16 }}
                  onClick={handleUploadButtonClick}
                >
                  立即上传
                </Button>
              </div>
            )
          }}
        />
      </Card>

      {/* 文档预览模态框 */}
      <Modal
        title={`文档预览 - ${previewDocument?.name}`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="download" onClick={() => {
            if (previewDocument) handleDownload(previewDocument);
          }}>
            下载
          </Button>,
          <Button key="close" type="primary" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width="80%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {previewDocument && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '60vh'
          }}>
            {previewDocument.type.startsWith('image/') ? (
              <img 
                src={previewDocument.content} 
                alt={previewDocument.name}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : previewDocument.type.includes('pdf') ? (
              <embed 
                src={previewDocument.content} 
                type="application/pdf"
                width="100%" 
                height="600px" 
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <p style={{ marginBottom: '16px' }}>
                  该文件类型不支持在线预览，请下载后查看
                </p>
                <Button 
                  type="primary" 
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(previewDocument)}
                >
                  下载文档
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 重命名模态框 */}
      <Modal
        title={`重命名文档 - ${renamingDoc?.name}`}
        open={renameModalVisible}
        onCancel={() => setRenameModalVisible(false)}
        onOk={confirmRename}
        destroyOnClose
      >
        <Form form={renameForm} layout="vertical">
          <Form.Item
            name="newName"
            label="新文件名"
            rules={[
              { required: true, message: '请输入文件名' },
              { min: 1, message: '文件名不能为空' },
              { max: 255, message: '文件名不能超过255个字符' }
            ]}
          >
            <Input placeholder="请输入新的文件名" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DocumentManagement;