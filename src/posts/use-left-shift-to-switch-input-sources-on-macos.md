---
title: 在 macOS 上使用左 Shift 切换输入法
published: 2022-03-26 19:38:53
tags:
  - macos
  - karabiner
---

在尝试了一周后，我还是没法接受用 Caps Lock 切换输入法、长按 Caps Lock 切换大小写的迷惑操作。

<!--more-->

> **update@2022.3.28**: 排除常见 VM 和远程工具，详见 `conditions`。
> **update@2022.4.4**: 允许在 `caps_lock` 的情况下切换输入法，但切换后并不保留 `caps_lock` 状态，若无需这一逻辑可自行去除 `from.modifiers.optional` 部分。
> **update@2022.4.6**: 发现 Snipaste 切换颜色 RGB / HEX 是用 Shift 的，文末总结了一下如果需要单 Shift 的可选方案（长按或 `Fn` 修饰）。
> **update@2022.5.19**: 在某些情况下可能偶发失效或输入高延迟，可以尝试在 Karabiner-Elements 中 Misc 标签下选择 `Restart Karabiner-Elements`。当然，如果没解决的话，那就是 macOS 过于咖喱了，我已经遇到自带输入法的不少问题了。
> **update@2023.1.7**: macOS Ventura 引入了简体中文输入法的无响应问题，此问题会导致所有前台应用连带无响应，直至超时恢复。无响应时只能选择重启或强制终止输入法进程，例如 `killall -9 SCIM_Extension`。如果你不知道上述命令的用途，建议选择其他第三方输入法直至 Apple 修复此问题。

## TL; DR

使用 Karabiner 改键，在 `~/.config/karabiner/karabiner.json` 中 `profiles.complex_modifications.rules` 部分加一条：

> **update@2022.5.19**: 现在你可以在安装完 Karabiner 后点[这里](karabiner://karabiner/assets/complex_modifications/import?url=https://idawnlight.com/assets/karabiner_shift.json)一键添加了，并且我会更推荐这种方式。这个配置文件同时包含了左 Shift 与右 Shift 对应的规则，导入后在弹出的窗口中启用需要的即可。

```json
{
    "description": "Use left_shift to switch input sources",
    "manipulators": [
        {
            "type": "basic",
            "from": {
                "key_code": "left_shift",
                "modifiers": {
                    "optional": [
                        "caps_lock"
                    ]
                }
            },
            "parameters": {
                "basic.to_if_alone_timeout_milliseconds": 200,
                "basic.to_if_held_down_threshold_milliseconds": 200
            },
            "to": [
                {
                    "key_code": "left_shift",
                    "lazy": true
                }
            ],
            "to_if_alone": [
                {
                    "key_code": "spacebar",
                    "modifiers": "control"
                }
            ],
            "to_if_held_down": [
                {
                    "key_code": "left_shift"
                }
            ],
            "conditions": [
                {
                    "type": "frontmost_application_unless",
                    "bundle_identifiers": [
                        "^com\\.teamviewer\\.TeamViewer$",
                        "^com\\.vmware\\.horizon$",
                        "^com\\.vmware\\.fusion$",
                        "^com\\.vmware\\.view$",
                        "^com\\.parallels\\.desktop$",
                        "^com\\.parallels\\.vm$",
                        "^com\\.parallels\\.desktop\\.console$",
                        "^org\\.virtualbox\\.app\\.VirtualBoxVM$",
                        "^com\\.citrix\\.XenAppViewer$",
                        "^com\\.vmware\\.proxyApp\\.",
                        "^com\\.parallels\\.winapp\\."
                    ]
                }
            ]
        }
    ]
}
```

![screenshot of karabiner "complex modifications" page](https://i.dawnlab.me/68a893103416ab4b1b18207caf76ebc0.png)

## 一点吐槽

Apple 默认使用 Caps Lock 切换输入法至少从我买上篇文章提到的那台老 MacBook 就开始了，我当时甚至完全没搞清楚它的切换逻辑，~~以至于一度怀疑大写锁定灯坏了，~~ 然后就直接用搜狗输入法替代了自带的。因为搜狗自带了中英文切换，也就不会涉及 macOS 默认的~~反人类~~切换逻辑。

> 但是显然 Apple 很喜欢这个方案，以至于在简体中文版键盘上除了含有全角符号标注外，大小写锁定直接成了「中/英」，这也是我选择定制美式英文键盘的一个很重要的原因。

然而不久前遇到了一点小的兼容性问题，搜狗输入法的英文模式在某些特定的应用中无法正常输入，必须切换到自带的英文输入法。这个小的 glitch 就比较让人难受，考虑到 iPhone 上一直使用自带输入法也没什么问题，就尝试着切到自带的简体拼音用了一周。结果默认的整套逻辑依然让我很不习惯，一方面是之前很长时间都在用 Windows 那套切换逻辑，另一方面是我之前几乎不会用 Shift 去输入大写字母。此外，因为还需要使用 Windows 虚拟机和偶尔远程解决一些 Windows 上的问题，即使 Parallels Desktop 也没有针对这一情况做映射，各类远程软件更是不可能做，操作体验极度割裂，不得不考虑换个切换输入法的方式。

## Karabiner 是这么用的吗（

久闻 Karabiner 的大名，但之前一直也没用过。网上其实有一些用 Karabiner 改键的教程，如果他们完美地解决了我的问题，那我肯定不会写这篇文章。问题在于我找到的解决方案完全没有做到优雅，或者依然与 Windows 上的切换方式有出入，比如以下几个：

- [修改MacOS下的输入法切换键为shift键 - CSDN](https://blog.csdn.net/qq_41437512/article/details/113588184)

简单来讲就是在 pressed alone 的情况下把 Caps Lock 和左 Shift 对调了，看起来没什么问题，但是并没有恢复 Caps Lock 基本的短按切换大小写的功能。

- [Mac 一键切换中英输入法方案 - 知乎](https://zhuanlan.zhihu.com/p/108748683)
- [Mac 使用 shift 快速实现中英文切换 - V2EX](https://www.v2ex.com/t/473948)

这两篇的作者似乎是同一个，方案是在 pressed alone 的情况下先映射到 F17 然后把切换快捷键改成 F17；通过把 `basic.to_if_held_down_threshold_milliseconds` 设为 1ms 以直接触发长按，并利用短触发的「长按」事件恢复 Shift 的功能。这样做存在两个问题：

1. 通过 Karabiner Event Viewer 可以看到实际上每次点按同时触发了 Shift 和 F17，显然不够优雅。
2. 实际上默认功能应该直接用 `to`，完全不需要也不应该使用设定为 1ms 的 `to_held_down`。

[V2EX #33](https://www.v2ex.com/t/473948#r_8183321) 提到了这个问题并给出了一个更合理的配置，少了一次映射，但并没有解决同时触发的问题。

## 改一改配置

Karabiner GUI 对于复杂映射的支持有限，所以需要直接编辑配置文件。加一条这样的 Rule：

```json
{
    "description": "Use left_shift to switch input sources",
    "manipulators": [
        {
            "type": "basic",
            "from": {
                "key_code": "left_shift",
                "modifiers": {
                    "optional": [
                        "caps_lock"
                    ]
                }
            },
            "parameters": {
                "basic.to_if_alone_timeout_milliseconds": 200,
                "basic.to_if_held_down_threshold_milliseconds": 200
            },
            "to": [
                {
                    "key_code": "left_shift",
                    "lazy": true
                }
            ],
            "to_if_alone": [
                {
                    "key_code": "spacebar",
                    "modifiers": "control"
                }
            ],
            "to_if_held_down": [
                {
                    "key_code": "left_shift"
                }
            ],
            "conditions": [
                {
                    "type": "frontmost_application_unless",
                    "bundle_identifiers": [
                        "^com\\.teamviewer\\.TeamViewer$",
                        "^com\\.vmware\\.horizon$",
                        "^com\\.vmware\\.fusion$",
                        "^com\\.vmware\\.view$",
                        "^com\\.parallels\\.desktop$",
                        "^com\\.parallels\\.vm$",
                        "^com\\.parallels\\.desktop\\.console$",
                        "^org\\.virtualbox\\.app\\.VirtualBoxVM$",
                        "^com\\.citrix\\.XenAppViewer$",
                        "^com\\.vmware\\.proxyApp\\.",
                        "^com\\.parallels\\.winapp\\."
                    ]
                }
            ]
        }
    ]
}
```

这条规则做了这些事：

1. 首先捕获 `left_shift` 按键（包括存在 `caps_lock` 这一 modifier 的情况）。
2. 如果仅按下左 Shift，并且时间不超过 200ms，则触发 `to_if_alone` 输入组合键 `Control ⌃ + Space`；如果超过 200ms，则触发 `to_if_held_down` 正常实现左 Shift 的功能。
3. 如果使用含左 Shift 的组合键，则正常实现左 Shift 的功能。
4. 因为 `to.lazy` 为 `true`，触发组合键前不会输入左 Shift，避免多重输入。这其实也是[官方推荐的做法](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to/lazy/)。
5. 通过 [`manipulators.conditions`](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/) 排除常见 VM 和远程工具，可以通过 Event Viewer 找到需要排除的应用的 `bundle_identifier`，比如 Parallels Desktop 的 `com.parallels.desktop.console`。目前的部分规则来自 [Emacs key bindings (rev 12)](https://ke-complex-modifications.pqrs.org/#emacs_key_bindings)。

![screenshot of karabiner event viewer "frontmost application"](https://i.dawnlab.me/e028683420583da829319349b06be175.png)

当然，这样改也同样不是完美的，少数使用单 Shift 作为快捷键的应用可能还是会出问题，~~也许去掉 `to.lazy` 可以解决，但我目前使用的应用中没有通过单 Shift 触发的快捷键，所以对我个人而言这样就是相对合理的配置了。~~ 发现 Snipaste 切换颜色 RGB / HEX 是用单 Shift 的，略微总结了一下这种情况的选择：

1. 如果是单 Shift，可以选择长按 Shift 或者使用 `Fn + Shift`。
2. 如果是双击 Shift，例如 IntelliJ 上的 Search Everywhere，可以通过 Fn + 双击 Shift 实现。这种情况 Karabiner 会认为是组合键因此不更改，但同时 Shift 并没有替代的功能按键，所以 macOS 会正常作为 Shift 处理并被应用捕获。