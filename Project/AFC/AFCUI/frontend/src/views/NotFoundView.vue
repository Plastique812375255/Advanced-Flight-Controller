<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-title">页面未找到</div>
      <div class="error-message">抱歉，您尝试访问的页面不存在或已被移动。</div>
      <div class="error-actions">
        <button class="back-button" @click="goBack">返回上一页</button>
        <button class="home-button" @click="goHome">返回首页</button>
      </div>
    </div>
    <div class="not-found-graphic">
      <div class="plane-container">
        <div class="plane"></div>
        <div class="plane-trail"></div>
      </div>
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    goHome() {
      this.$router.push({ name: 'Desktop' });
    }
  }
};
</script>

<style lang="scss" scoped>
.not-found {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
  position: relative;
  overflow: hidden;
}

.not-found-content {
  z-index: 10;
  text-align: center;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #2196f3;
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.back-button {
    background-color: #e0e0e0;
    color: #333;
    
    &:hover {
      background-color: #d0d0d0;
    }
  }
  
  &.home-button {
    background-color: #2196f3;
    color: white;
    
    &:hover {
      background-color: #1976d2;
    }
  }
}

// 装饰性图形
.not-found-graphic {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.plane-container {
  position: absolute;
  top: 30%;
  left: -100px;
  animation: fly 15s linear infinite;
}

@keyframes fly {
  0% {
    transform: translateX(0) translateY(0);
  }
  25% {
    transform: translateX(calc(25vw)) translateY(-50px);
  }
  50% {
    transform: translateX(calc(50vw)) translateY(0);
  }
  75% {
    transform: translateX(calc(75vw)) translateY(50px);
  }
  100% {
    transform: translateX(calc(100vw + 100px)) translateY(0);
  }
}

.plane {
  width: 60px;
  height: 20px;
  background-color: #2196f3;
  clip-path: polygon(0% 50%, 25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%);
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 30px;
    background-color: #2196f3;
    transform: translate(-50%, -50%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }
}

.plane-trail {
  position: absolute;
  top: 50%;
  right: 0;
  width: 40px;
  height: 3px;
  transform: translateY(-50%);
  background: linear-gradient(to left, rgba(33, 150, 243, 0), rgba(33, 150, 243, 0.8));
}

.cloud {
  position: absolute;
  background-color: white;
  border-radius: 50%;
  opacity: 0.8;
  
  &:before, &:after {
    content: '';
    position: absolute;
    background-color: white;
    border-radius: 50%;
  }
  
  &.cloud-1 {
    width: 100px;
    height: 60px;
    top: 20%;
    left: 10%;
    animation: float 20s ease-in-out infinite;
    
    &:before {
      width: 60px;
      height: 60px;
      top: -30px;
      left: 15px;
    }
    
    &:after {
      width: 50px;
      height: 50px;
      top: -20px;
      right: 15px;
    }
  }
  
  &.cloud-2 {
    width: 70px;
    height: 40px;
    top: 40%;
    right: 20%;
    animation: float 15s ease-in-out infinite 2s;
    
    &:before {
      width: 40px;
      height: 40px;
      top: -20px;
      left: 10px;
    }
    
    &:after {
      width: 30px;
      height: 30px;
      top: -15px;
      right: 10px;
    }
  }
  
  &.cloud-3 {
    width: 120px;
    height: 70px;
    bottom: 15%;
    left: 30%;
    animation: float 25s ease-in-out infinite 5s;
    
    &:before {
      width: 70px;
      height: 70px;
      top: -35px;
      left: 20px;
    }
    
    &:after {
      width: 60px;
      height: 60px;
      top: -25px;
      right: 20px;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
</style> 