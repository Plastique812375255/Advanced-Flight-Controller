package com.example.androidwebviewapp;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private EditText urlEditText;
    private Button goButton, backButton, forwardButton, reloadButton, localButton;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 确保全屏显示（隐藏状态栏）
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        
        setContentView(R.layout.activity_main);

        // 初始化控件
        webView = findViewById(R.id.webView);
        urlEditText = findViewById(R.id.urlEditText);
        goButton = findViewById(R.id.goButton);
        backButton = findViewById(R.id.backButton);
        forwardButton = findViewById(R.id.forwardButton);
        reloadButton = findViewById(R.id.reloadButton);
        localButton = findViewById(R.id.localButton);

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

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                urlEditText.setText(url);
            }
        });

        // 设置WebChromeClient处理JavaScript对话框、标题等
        webView.setWebChromeClient(new WebChromeClient());

        // 设置按钮点击事件
        goButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String url = urlEditText.getText().toString();
                if (!url.isEmpty()) {
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "http://" + url;
                    }
                    webView.loadUrl(url);
                }
            }
        });

        backButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (webView.canGoBack()) {
                    webView.goBack();
                }
            }
        });

        forwardButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (webView.canGoForward()) {
                    webView.goForward();
                }
            }
        });

        reloadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                webView.reload();
            }
        });

        localButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                webView.loadUrl("file:///android_asset/html/index.html");
            }
        });

        // 默认加载本地HTML
        webView.loadUrl("file:///android_asset/html/index.html");
    }

    // 处理返回键
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
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