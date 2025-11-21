import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ListingCard from '../components/listing/ListingCard';
import Navbar from '../components/layout/Navbar';
import { AuthContext } from '../contexts/AuthContext';

// ========== test 1: ListingCard components ==========
describe('ListingCard Component', () => {
  it('should display the listing title', () => {
    const mockListing = {
      id: 123,
      title: 'Beautiful Beach House',
      thumbnail: 'https://example.com/image.jpg',
      metadata: {
        propertyType: 'House',
        bedrooms: 3,
        bathrooms: 2,
      },
      price: 200,
      reviews: [],
    };

    render(
      <BrowserRouter>
        <ListingCard listing={mockListing} />
      </BrowserRouter>
    );

    expect(screen.getByText('Beautiful Beach House')).toBeInTheDocument();
  });
});

// ========== test 2: Navbar components ==========
describe('Navbar Component', () => {
  it('should show Login and Register buttons when not logged in', () => {
    // 模拟未登录状态（token 为 null）
    const mockAuthValue = {
      token: null,
      email: null,
      saveAuth: () => {},
      clearAuth: () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // 检查是否显示 Login 和 Register 按钮
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should show Logout button when logged in', () => {
    const mockAuthValue = {
      token: 'fake-token-123',
      email: 'test@example.com',
      saveAuth: () => {},
      clearAuth: () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    // 检查是否显示包含 "Logout" 的按钮
    expect(screen.getByText(/Logout/)).toBeInTheDocument();
    // 检查是否显示邮箱
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    // 不应该显示 Login 按钮
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

});


  // ========== test 3: Button 交互测试 ==========
describe('Button Component', () => {
  it('should render a button and handle click events', () => {
    let clickCount = 0;
    const handleClick = () => {
      clickCount += 1;
    };

    const { getByRole } = render(
      <button onClick={handleClick}>Click Me</button>
    );

    const button = getByRole('button');
    
    // 检查按钮是否存在
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
    
    // 模拟点击
    button.click();
    
    // 检查点击处理函数是否被调用
    expect(clickCount).toBe(1);
  });
});