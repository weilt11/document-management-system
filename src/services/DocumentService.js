class DocumentService {
  constructor() {
    this.storageKey = 'documents';
    this.maxFileSize = 10 * 1024 * 1024; // 10MB限制
  }

  // 获取用户文档列表
  getUserDocuments(userId) {
    try {
      const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return documents
        .filter(doc => doc.ownerId === userId)
        .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    } catch (error) {
      console.error('获取文档列表失败:', error);
      return [];
    }
  }

  // 上传文档
  uploadDocument(file, user) {
    return new Promise((resolve, reject) => {
      // 检查文件大小
      if (file.size > this.maxFileSize) {
        reject(new Error(`文件大小不能超过 ${this.maxFileSize / 1024 / 1024}MB`));
        return;
      }

      // 检查文件名是否已存在
      const existingDocs = this.getUserDocuments(user.id);
      if (existingDocs.some(doc => doc.name === file.name)) {
        reject(new Error(`文件 "${file.name}" 已存在`));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
          const newDocument = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: e.target.result,
            ownerId: user.id,
            uploadTime: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };

          documents.push(newDocument);
          localStorage.setItem(this.storageKey, JSON.stringify(documents));
          
          // 记录操作日志
          this.addOperationLog(user.id, `上传文档: ${file.name}`);
          
          resolve(newDocument);
        } catch (error) {
          reject(new Error('文件存储失败'));
        }
      };
      
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  // 删除文档
  deleteDocument(documentId, user) {
    try {
      const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const documentIndex = documents.findIndex(doc => doc.id === documentId);
      
      if (documentIndex !== -1 && documents[documentIndex].ownerId === user.id) {
        const deletedDoc = documents.splice(documentIndex, 1)[0];
        localStorage.setItem(this.storageKey, JSON.stringify(documents));
        
        // 记录操作日志
        this.addOperationLog(user.id, `删除文档: ${deletedDoc.name}`);
        
        return { success: true };
      }
      
      return { success: false, message: '文档不存在或没有权限' };
    } catch (error) {
      return { success: false, message: '删除失败' };
    }
  }

  // 下载文档 - 修复版本
  downloadDocument(documentId, user) {
    try {
      const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const document = documents.find(doc => doc.id === documentId && doc.ownerId === user.id);
      
      if (document) {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = document.content;
        link.download = document.name;
        link.style.display = 'none';
        
        // 添加到DOM并触发点击
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 记录操作日志
        this.addOperationLog(user.id, `下载文档: ${document.name}`);
        
        return { success: true };
      }
      
      return { success: false, message: '文档不存在或没有权限' };
    } catch (error) {
      console.error('下载文档失败:', error);
      return { success: false, message: '下载失败' };
    }
  }

  // 预览文档 - 修复版本
  previewDocument(documentId, user) {
    try {
      const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const document = documents.find(doc => doc.id === documentId && doc.ownerId === user.id);
      
      if (document) {
        return { success: true, document };
      }
      
      return { success: false, message: '文档不存在或没有权限' };
    } catch (error) {
      console.error('预览文档失败:', error);
      return { success: false, message: '预览失败' };
    }
  }

  // 重命名文档
  renameDocument(documentId, newName, user) {
    try {
      const documents = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const documentIndex = documents.findIndex(doc => doc.id === documentId && doc.ownerId === user.id);
      
      if (documentIndex !== -1) {
        // 检查新名称是否已存在
        const nameExists = documents.some((doc, index) => 
          index !== documentIndex && doc.name === newName && doc.ownerId === user.id
        );
        
        if (nameExists) {
          return { success: false, message: '文件名已存在' };
        }
        
        const oldName = documents[documentIndex].name;
        documents[documentIndex].name = newName;
        documents[documentIndex].lastModified = new Date().toISOString();
        
        localStorage.setItem(this.storageKey, JSON.stringify(documents));
        
        // 记录操作日志
        this.addOperationLog(user.id, `重命名文档: ${oldName} -> ${newName}`);
        
        return { success: true };
      }
      
      return { success: false, message: '文档不存在或没有权限' };
    } catch (error) {
      return { success: false, message: '重命名失败' };
    }
  }

  // 获取文档统计信息
  getDocumentStats(userId) {
    const documents = this.getUserDocuments(userId);
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    
    return {
      totalCount: documents.length,
      totalSize,
      recentUploads: documents.slice(0, 5)
    };
  }

  // 操作日志记录 - 修复版本
  addOperationLog(userId, action) {
    try {
      console.log('记录操作日志:', { userId, action });
      
      const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
      const newLog = {
        id: Date.now().toString(),
        userId,
        action,
        timestamp: new Date().toISOString()
      };
      
      logs.push(newLog);
      localStorage.setItem('operationLogs', JSON.stringify(logs));
      
      console.log('操作日志已保存:', newLog);
      console.log('当前所有日志:', logs);
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  // 获取支持的文件类型
  getSupportedFileTypes() {
    return {
      'image/*': '图片文件',
      'application/pdf': 'PDF文档',
      'application/msword': 'Word文档',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
      'text/plain': '文本文件',
      'application/vnd.ms-excel': 'Excel文件',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel文件',
      'application/zip': '压缩文件',
      'application/x-rar-compressed': '压缩文件'
    };
  }

  // 获取文件类型图标
  getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    return '📎';
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;
    let size = bytes;
    
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }
    
    return `${size.toFixed(1)} ${units[index]}`;
  }

  // 获取文件类型名称
  getFileTypeName(fileType) {
    const typeMap = {
      'image/jpeg': 'JPEG图片',
      'image/png': 'PNG图片',
      'image/gif': 'GIF图片',
      'image/bmp': 'BMP图片',
      'image/webp': 'WebP图片',
      'application/pdf': 'PDF文档',
      'application/msword': 'Word文档',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
      'text/plain': '文本文件',
      'application/vnd.ms-excel': 'Excel文件',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel文件',
      'application/zip': 'ZIP压缩文件',
      'application/x-rar-compressed': 'RAR压缩文件'
    };
    
    return typeMap[fileType] || fileType || '未知类型';
  }
}

export default new DocumentService();