import React from 'react';
import { Card, Alert } from 'antd';

const UserManagement = () => {
  console.log('用户管理组件已加载');
  
  return (
    <div>
      <Alert 
        message="用户管理页面已正常加载" 
        type="success" 
        showIcon 
        style={{ marginBottom: 16 }}
      />
      <Card title="用户管理">
        <h2>用户管理功能</h2>
        <p>用户管理页面内容将在这里显示。</p>
      </Card>
    </div>
  );
};

export default UserManagement;