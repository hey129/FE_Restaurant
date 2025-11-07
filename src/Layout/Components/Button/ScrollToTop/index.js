import React, { useState, useEffect } from "react";

function ScrollToTopButton() {
  // 1. State để theo dõi nút có nên hiển thị hay không
  const [isVisible, setIsVisible] = useState(false);

  // Hàm xử lý việc hiển thị nút
  const toggleVisibility = () => {
    // Nếu cuộn xuống hơn 300px, hiển thị nút
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Hàm xử lý khi click vào nút, cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn mượt
    });
  };

  // 2. useEffect để thêm và xóa event listener
  useEffect(() => {
    // Thêm event listener khi component được mount
    window.addEventListener("scroll", toggleVisibility);

    // Xóa event listener khi component bị unmount để tránh rò rỉ bộ nhớ
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
    >
      {isVisible && (
        <button
          onClick={scrollToTop}
          style={{
            padding: "10px 15px",
            fontSize: "16px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          ↑ Page Up
        </button>
      )}
    </div>
  );
}

export default ScrollToTopButton;
