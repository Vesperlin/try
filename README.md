<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vesper 系统入口</title>
  <style>
    body { margin:0; font-family:-apple-system; background:#111; color:#fff; display:flex; }
    nav {
      width:200px; background:#181818; height:100vh; padding-top:20px;
      border-right:1px solid #333; position:fixed; left:0; top:0;
    }
    nav h1 { text-align:center; font-size:18px; margin-bottom:20px; }
    nav ul { list-style:none; padding:0; }
    nav li {
      padding:12px 20px; cursor:pointer; transition:0.3s; color:#ccc;
    }
    nav li:hover { background:#222; color:#4da6ff; }
    main {
      margin-left:200px; padding:20px; flex:1;
    }
    .search input {
      width:100%; padding:10px; border:none; border-radius:8px;
      background:#222; color:#fff; font-size:14px;
    }
    .section { margin:20px 0; }
    .section h2 { font-size:16px; color:#aaa; margin-bottom:10px; }
    .cards { display:flex; flex-wrap:wrap; gap:10px; }
    .card {
      flex:1 1 200px; background:#222; padding:20px; border-radius:10px;
      text-align:center; font-size:16px; font-weight:bold; cursor:pointer;
      transition:0.3s;
    }
    .card:hover { background:#333; color:#4da6ff; }
  </style>
</head>
<body>
  <nav>
    <h1>导航</h1>
    <ul>
      <li>首页</li>
      <li>收藏夹</li>
      <li>OCR</li>
      <li>AI 助手</li>
      <li>工具箱</li>
      <li>我的</li>
      <li>设置</li>
    </ul>
  </nav>
  <main>
    <div class="search">
      <input type="text" placeholder="🔍 搜索功能...">
    </div>
    <div class="section">
      <h2>收藏夹</h2>
      <div class="cards">
        <div class="card">OCR</div>
        <div class="card">AI 助手</div>
      </div>
    </div>
    <div class="section">
      <h2>全部功能</h2>
      <div class="cards">
        <div class="card">OCR</div>
        <div class="card">AI 助手</div>
        <div class="card">工具箱</div>
        <div class="card">我的</div>
      </div>
    </div>
  </main>
</body>
</html>
