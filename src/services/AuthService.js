import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider初始化');
    const userInfo = localStorage.getItem('currentUser');
    console.log('📁 从localStorage读取的用户信息:', userInfo);
    
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        console.log('✅ 用户信息解析成功:', parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('❌ 解析用户信息失败:', error);
        localStorage.removeItem('currentUser');
      }
    } else {
      console.log('ℹ️ 未找到已登录用户');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    console.log('🔑 登录尝试:', username);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.log('👥 现有用户:', users);
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const userInfo = { ...user };
      delete userInfo.password;
      
      localStorage.setItem('currentUser', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
      
      console.log('✅ 登录成功:', userInfo);
      return { success: true };
    } else {
      console.log('❌ 登录失败: 用户名或密码错误');
      return { success: false, message: '用户名或密码错误' };
    }
  };

  const register = async (userData) => {
    console.log('📝 注册用户:', userData);
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.username === userData.username)) {
      return { success: false, message: '用户名已存在' };
    }

    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      password: userData.password,
      email: userData.email,
      role: 'USER',
      createTime: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ 注册成功，用户列表:', users);
    return { success: true, message: '注册成功' };
  };

  const logout = () => {
    console.log('🚪 用户登出');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};