import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Alert, Button } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../services/AuthService';

const OperationLog = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    setLoading(true);
    try {
      console.log('开始加载操作日志...');
      
      // 从localStorage获取日志
      const allLogs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
      console.log('从localStorage获取的原始日志:', allLogs);
      
      // 获取用户信息
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      console.log('用户列表:', users);
      
      // 处理日志数据
      let processedLogs = allLogs;
      
      // 如果不是管理员，只显示当前用户的日志
      if (currentUser.role !== 'ADMIN') {
        processedLogs = allLogs.filter(log => log.userId === currentUser.id);
        console.log('过滤后的用户日志:', processedLogs);
      }
      
      // 添加用户名信息
      const logsWithUsername = processedLogs.map(log => {
        const user = users.find(u => u.id === log.userId);
        return {
          ...log,
          username: user ? user.username : '未知用户'
        };
      });
      
      // 按时间倒序排列
      const sortedLogs = logsWithUsername.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      console.log('最终显示的日志:', sortedLogs);
      setLogs(sortedLogs);
      
    } catch (error) {
      console.error('加载操作日志失败:', error);
    }
    setLoading(false);
  };

  // 清空日志
  const clearLogs = () => {
    localStorage.setItem('operationLogs', '[]');
    setLogs([]);
    console.log('操作日志已清空');
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (username, record) => (
        <Tag color={record.userId === currentUser.id ? 'blue' : 'default'}>
          {username}
        </Tag>
      )
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: '50%',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => new Date(time).toLocaleString(),
      width: 200,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="操作日志" 
        bordered={false}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadLogs}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ddd', marginBottom: 16 }} />
            <div style={{ color: '#999', marginBottom: 16 }}>
              暂无操作日志
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              请尝试进行一些操作（如上传、下载、删除文档），然后刷新查看日志。
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>共 {logs.length} 条操作记录</span>
              <Button 
                size="small" 
                danger 
                onClick={clearLogs}
              >
                清空日志
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={logs}
              rowKey="id"
              loading={loading}
              pagination={{ 
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
              size="middle"
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default OperationLog;