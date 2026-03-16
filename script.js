// 初始化Mermaid
mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'monospace'
});

// API配置
const API_CONFIG = {
    deepseek: {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
        defaultKey: 'sk-xxx'  // 这里可以用你的测试密钥
    },
    gpt: {
        url: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo'
    }
};

// 预置模板
const TEMPLATES = {
    '麦克斯韦方程组': '请用LaTeX格式写出麦克斯韦方程组的微分形式',
    '快速排序流程图': '用Mermaid画出快速排序的流程图',
    '框架对比表格': '生成一个Markdown表格，对比PyTorch、TensorFlow、JAX三个深度学习框架的特点',
    '贝叶斯公式': '用LaTeX写出贝叶斯公式，并附上简短解释'
};

// 生成按钮点击事件
document.getElementById('generate-btn').addEventListener('click', generate);

// 清空按钮
document.querySelector('.btn-clear').addEventListener('click', function() {
    document.getElementById('prompt').value = '';
});

// 预置模板按钮
document.querySelector('.btn-template').addEventListener('click', function() {
    const templateKeys = Object.keys(TEMPLATES);
    const randomKey = templateKeys[Math.floor(Math.random() * templateKeys.length)];
    document.getElementById('prompt').value = TEMPLATES[randomKey];
});

// 生成函数
async function generate() {
    const prompt = document.getElementById('prompt').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model-select').value;
    
    if (!prompt) {
        alert('请输入需求内容');
        return;
    }
    
    // 如果没填key，提示但继续（可以用测试模式）
    if (!apiKey) {
        alert('提示：未输入API密钥，将使用测试数据');
        setTimeout(() => {
            const response = getMockResponse(prompt);
            updatePreview(response);
        }, 500);
        return;
    }
    
    // 显示加载状态
    const btn = document.getElementById('generate-btn');
    const originalText = btn.textContent;
    btn.textContent = '生成中...';
    btn.disabled = true;
    
    try {
        // 调用DeepSeek API
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `你是一个专业的学术写作助手。请严格按照用户要求输出内容。
重要规则：
1. 数学公式必须用LaTeX格式：行内公式用$...$，行间公式用$$...$$
2. 流程图必须用Mermaid语法，用\`\`\`mermaid包裹
3. 表格使用规范的Markdown表格格式
4. 代码块要标明语言
5. 直接返回内容，不要额外解释`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'API请求失败');
        }
        
        const data = await response.json();
        const markdown = data.choices[0].message.content;
        
        // 更新预览
        updatePreview(markdown);
        
    } catch (error) {
        console.error('API错误:', error);
        alert('生成失败：' + error.message + '\n将使用测试数据');
        
        // 出错时用测试数据保证演示不中断
        const mockResponse = getMockResponse(prompt);
        updatePreview(mockResponse);
        
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// 模拟响应（用于无API测试）
function getMockResponse(prompt) {
    if (prompt.includes('麦克斯韦') || prompt.includes('公式')) {
        return `## 麦克斯韦方程组（微分形式）

$$
\\begin{align}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{align}
$$

其中：
- $\\mathbf{E}$ 是电场强度
- $\\mathbf{B}$ 是磁感应强度
- $\\rho$ 是电荷密度
- $\\mathbf{J}$ 是电流密度`;
    }
    
    if (prompt.includes('流程图') || prompt.includes('排序')) {
        return `## 快速排序流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{数组长度≤1？}
    B -->|是| C[返回数组]
    B -->|否| D[选择基准值pivot]
    D --> E[分区: 小于基准/大于基准]
    E --> F[递归排序左半部分]
    E --> G[递归排序右半部分]
    F --> H[合并结果]
    G --> H
    H --> I[返回排序后数组]
\`\`\`

**算法步骤**：
1. 选择基准元素
2. 分区操作
3. 递归排序子数组`;
    }
    
    if (prompt.includes('表格')) {
        return `## 深度学习框架对比

| 框架 | 主要特点 | 适用场景 | 学习曲线 |
|:-----|:---------|:---------|:---------|
| PyTorch | 动态计算图，调试方便 | 研究、原型开发 | 中等 |
| TensorFlow | 生产部署完善，Keras API | 工业应用 | 较陡 |
| JAX | 函数式编程，自动微分 | 前沿研究 | 较陡 |

**选型建议**：
- 学术研究首选 PyTorch
- 工业部署考虑 TensorFlow
- 高性能计算尝试 JAX`;
    }
    
    return `## 生成结果

这是一个示例响应。您的输入是：${prompt}

### 数学公式示例
$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi
$$

### 流程图示例
\`\`\`mermaid
graph LR
    A[输入] --> B{处理}
    B --> C[输出]
\`\`\`

### 表格示例
| 列1 | 列2 |
|:---|:---|
| 数据1 | 数据2 |`;
}

// 更新预览
function updatePreview(markdown) {
    const preview = document.getElementById('preview');
    
    // 保存原始Markdown
    window.lastMarkdown = markdown;
    
    // 解析Markdown为HTML
    let html = marked.parse(markdown);
    preview.innerHTML = html;
    
    // 渲染数学公式 (使用KaTeX)
    renderMathInElement(preview, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError: false
    });
    
    // 渲染Mermaid图表
    mermaid.init(undefined, preview.querySelectorAll('.mermaid'));
    
    // 代码高亮
    preview.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
}

// 复制Markdown
function copyMarkdown() {
    if (!window.lastMarkdown) {
        alert('没有可复制的内容');
        return;
    }
    navigator.clipboard.writeText(window.lastMarkdown);
    showToast('已复制到剪贴板');
}

// 导出LaTeX (简化版)
function exportLatex() {
    if (!window.lastMarkdown) {
        alert('没有可导出的内容');
        return;
    }
    
    // 创建下载链接
    const blob = new Blob([window.lastMarkdown], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    a.click();
    URL.revokeObjectURL(url);
}

// 导出Word (简化版)
function exportDocx() {
    alert('Word导出功能开发中，暂用复制Markdown代替');
    copyMarkdown();
}

// 提示工具
function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 1000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}