import os

def main():
    print("=== GitHub Issue 文章生成器 ===\n")
    name = input("你的名字: ")
    partner = input("你的同伴名字: ")
    
    print("\n--- 源代码管理体验 ---")
    scm_exp = input("请简要描述你和同伴在签入、复审、合并冲突等方面的操作和体会: ")
    
    print("\n--- 代码例子 ---")
    code_example = input("请粘贴一个你们在源代码管理中用到的代码片段（如合并冲突解决、代码复审建议等）: ")
    
    print("\n--- AI-coding 工具体验 ---")
    ai_tools = input("你下载并使用了哪些 AI-coding 工具（如 Copilot、Cursor、Tabnine 等）: ")
    ai_exp = input("请描述你对这些 AI-coding 工具的体验和看法: ")
    
    print("\n--- 文章标题 ---")
    title = input("请为你的 GitHub 文章拟一个标题: ")
    
    # 生成 markdown 内容
    md = f"""# {title}

## 1. 基本信息
- 作者: {name}
- 合作同伴: {partner}

## 2. 源代码管理的基本操作体验
{scm_exp}

### 代码例子
```python
{code_example}
```

## 3. AI-coding 工具体验
- 使用的工具: {ai_tools}

{ai_exp}

## 4. 总结
通过本次练习，我和我的同伴更加熟悉了源代码管理的流程，也体验了 AI-coding 工具对编程效率的提升。欢迎大家交流讨论！
"""

    print("\n=== 生成的 GitHub Issue 文章如下 ===\n")
    print(md)
    
    save = input("\n是否保存为 markdown 文件？(y/n): ")
    if save.lower() == 'y':
        filename = input("请输入文件名（如 my_github_issue.md）: ")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"已保存为 {filename}")
    else:
        print("未保存文件，仅在终端显示。")

if __name__ == "__main__":
    main() 