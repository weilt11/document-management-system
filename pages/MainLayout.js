import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Button, Modal, Form, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  FolderOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../services/AuthService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm] = Form.useForm();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const showProfileModal = () => {
    setProfileModalVisible(true);
    // 填充当前用户信息到表单
    profileForm.setFieldsValue({
      username: currentUser?.username,
      email: currentUser?.email,
      role: currentUser?.role
    });
  };

  const handleProfileOk = () => {
    setProfileModalVisible(false);
    // 这里可以添加更新用户信息的逻辑
    message.success('个人信息已更新');
  };

  const handleProfileCancel = () => {
    setProfileModalVisible(false);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: showProfileModal,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/main/documents',
      icon: <FolderOutlined />,
      label: '文档管理',
    },
    {
      key: '/main/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/main/logs',
      icon: <BarChartOutlined />,
      label: '操作日志',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout className="main-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          {collapsed ? 'DMS' : '文档管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout className="site-layout">
        <Header className="site-layout-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{currentUser?.username}</span>
                <SettingOutlined style={{ marginLeft: 8 }} />
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="site-layout-content">
          <div className="content-inner">
            {children}
          </div>
        </Content>
      </Layout>

      {/* 个人信息模态框 */}
      <Modal
        title="个人信息"
        open={profileModalVisible}
        onOk={handleProfileOk}
        onCancel={handleProfileCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={profileForm}
          layout="vertical"
          name="profileForm"
        >
          <Form.Item
            label="用户名"
            name="username"
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
          >
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default MainLayout;