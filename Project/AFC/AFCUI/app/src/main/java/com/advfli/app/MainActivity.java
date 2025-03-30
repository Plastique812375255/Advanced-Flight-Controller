package com.advfli.app;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import android.annotation.SuppressLint;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 设置全屏模式
        setupFullScreen();
        
        setContentView(R.layout.activity_main);

        // 初始化WebView
        webView = findViewById(R.id.webView);

        // 配置WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);  // 启用JavaScript
        webSettings.setDomStorageEnabled(true);  // 启用DOM存储
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);  // 使用默认缓存
        webSettings.setAllowFileAccess(true);  // 允许文件访问
        webSettings.setAllowContentAccess(true);  // 允许内容访问
        webSettings.setAllowFileAccessFromFileURLs(true);  // 允许文件URL的文件访问
        webSettings.setAllowUniversalAccessFromFileURLs(true);  // 允许通用访问

        // 设置WebViewClient以在WebView内处理导航
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // 让所有链接都在WebView中打开，而不是在默认浏览器中
                return false;
            }
        });

        // 设置WebChromeClient处理JavaScript对话框、标题等
        webView.setWebChromeClient(new WebChromeClient());
        
        // 禁用WebView的返回手势
        webView.setOnKeyListener((v, keyCode, event) -> {
            if (keyCode == KeyEvent.KEYCODE_BACK) {
                // 拦截返回键事件
                return true;
            }
            return false;
        });

        // 默认加载本地HTML
        webView.loadUrl("file:///android_asset/html/index.html");
        
        // 禁用系统手势导航
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().getDecorView().findViewById(android.R.id.content).setOnTouchListener((v, event) -> {
                // 检测边缘滑动手势并拦截
                if (event.getX() < 20 || event.getX() > getWindow().getDecorView().getWidth() - 20) {
                    return true; // 拦截边缘滑动
                }
                return false;
            });
        }
    }
    
    private void setupFullScreen() {
        try {
            // 先尝试使用新的API
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            controller.hide(WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            
            // 禁用手势导航
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                // Android 10及以上
                controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
                getWindow().getDecorView().setOnApplyWindowInsetsListener((v, insets) -> {
                    return insets;
                });
            }
        } catch (Exception e) {
            // 如果新API失败，回退到旧方法
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                getWindow().setDecorFitsSystemWindows(false);
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                );
            } else {
                getWindow().setFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN,
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
                );
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_FULLSCREEN
                );
            }
        }
    }

    // 处理返回键
    @Override
    public void onBackPressed() {
        // 屏蔽系统返回手势，完全禁用返回功能
        // 如需在特定页面允许返回，可通过WebView的URL判断
        
        // 原代码（如果想保留WebView内部返回功能，取消下方注释）
        /*
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
        */
    }
    
    // 拦截系统返回键
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getKeyCode() == KeyEvent.KEYCODE_BACK) {
            // 返回true表示事件已被处理，阻止默认行为
            return true;
        }
        return super.dispatchKeyEvent(event);
    }

    // 释放WebView资源
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
} 