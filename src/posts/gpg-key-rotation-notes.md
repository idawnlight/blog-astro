---
title: GPG 密钥轮换小记
published: 2022-12-2 20:00:00
tags:
  - gpg
  - gnupg
  - pgp
  - yubikey
  - canokey
---

虽然我在 2018 年就生成了现在正在使用的密钥，但实际上从去年购入 CanoKey 后才开始较为合理地使用，生成了子密钥、设定了有效期并将其移至 CanoKey。目前设定的有效期将至，同时由于日常设备大多仅有 USB Type-C 接口，准备将主力密钥改为之前购买的 YubiKey 5C，在此记录一下轮换密钥的过程。

<!--more-->

> 本文主要内容译自 [GPG key rotation notes](https://wincent.com/wiki/GPG_key_rotation_notes)，文中案例替换为了我正在使用的密钥，内容有删改。原文作者并未使用硬件密钥，部分建议不适用，本文会尝试以脚注的形式给出我目前的实践，就像这样[^footnote-example]。如有错误或更好的操作建议，烦请不吝指正。

> 如果你只想获取我最新密钥：[https://keys.openpgp.org/search?q=idawn@live.com](https://keys.openpgp.org/search?q=idawn@live.com)

```
curl https://keys.openpgp.org/vks/v1/by-fingerprint/D5226A5EB826767F95C04AB3AEBAF58091A597C3 | gpg --import
```

## 执行摘要 Executive summary

- **为每一个「身份」创建一个主密钥。** 通常情况下，这意味着你会为个人和工作的电子邮件地址分别创建一个主密钥，以便于在离职后可以选择吊销用于工作的那个密钥。
- **给主密钥设定一个有效期。** 这是一个「[失能开关](https://zh.wikipedia.org/wiki/%E5%A4%B1%E8%83%BD%E5%BC%80%E5%85%B3)」：你可以随时更改密钥的有效期（即使过期了），因此没有必要生成新的密钥。[^1]
- **保持主密钥「离线」。** 例如将他们放在 1Password 或加密存储在其他地方，在日常使用的系统中仅保留子密钥。
- **一个子密钥可以在不同的设备上使用[^subkey]。** 如果必须要吊销一个密钥，那就吊销它，并在所有设备上更新密钥。不要试图为每个设备创建一个独立的身份（密钥）。
- **使用默认的加密子密钥。** 在创建主密钥时，GPG 会默认同时创建一个用于加密的子密钥，可以（设置有效期后）直接使用。过期后，生成一个新的就好。
- **创建一个用于签名的子密钥（如果需要的话）。** 主密钥 **可以** 用于签名，但因为你会离线保存它，所以当（且仅当）你需要签名时，创建一个用于签名的子密钥。和用于加密的子密钥一样，你应该设置一个有效期，定期生成新的密钥。
- **同步过期时间以减轻维护的负担。** 让所有密钥的过期时间一致，以便于同时更新它们。这通常意味着为主密钥设置新的过期时间，并且重新生成子密钥。选一个合理的周期（例如一到两年），不要太短以至于成为负担，也不要太长以至于忘了如何更新。

> 我并不完全支持原作者的观点，同时在任何时候都**不建议**完全采纳别人的建议（包括这一篇）。

## 密钥轮换的示例步骤

> 请注意，这里与原文不完全一致，为我本次轮换密钥的实际情况。

### 检查需要轮换的 <code style="font-size: inherit">idawn<span></span>@live.com</code> 的密钥

首先，让我们检查一下当前密钥的情况：

```shell
$ gpg --edit-key idawn@live.com
```

结果是：

```
Secret subkeys are available.

pub  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: never       usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

- 通常情况下，当你创建了一个密钥时，你会得到一个标记为 `sec` (secret) 的主密钥。
  - 这个主密钥同时也是一个签名密钥（usage 为 `SC`：`S` 指 signing，即可以用于签名；`C` 指 certification，即可以用于创建其他密钥，通常意味着这是主密钥）
  - 默认地，一个 `ssb` (subkey) 也会被创建，usage 为 `E` (encryption)
- 我们这里没有 `sec`，只有 `pub`，意味着我们只有主密钥的公钥部分，`usage: SC` 表明它是一个签名密钥和主密钥。主密钥的私钥部分被离线存储了。
- `ssb` 是标准的子密钥，`usage: E` 和 `usage: S` 表明它们分别是用于加密和签名的子密钥。

所以，我们接下来要做的是：

1. 从我们的离线存储中导入主密钥。
2. 给主密钥设定新的有效期。
3. 生成用于签名的新的子密钥，并于主密钥的有效期保持一致。
4. 生成用于加密的新的子密钥，并于主密钥的有效期保持一致。
5. 从 GnuPG 中导出更新后的密钥（主密钥的公钥与私钥，以及子密钥[^2]）。
6. 将导出的主密钥重新离线存储。
7. 从 GnuPG 的 keyring 中移除主密钥的私钥（使其离线）。
8. [可选] 将更新后的公钥上传至公钥服务器。

### 导入主密钥

首先，取出之前离线备份的主密钥[^3]，将它导入到 GnuPG 的 keyring 中：

```shell
$ gpg --import random_name.asc
gpg: key AEBAF58091A597C3: "Light Dawn (idawnlight) <idawn@live.com>" 1 new signature
gpg: key AEBAF58091A597C3: secret key imported
gpg: Total number processed: 1
gpg:         new signatures: 1
gpg:       secret keys read: 1
gpg:   secret keys imported: 1
gpg:  secret keys unchanged: 1
```

导入后，与之前的 `gpg --edit-key idawn@live.com` 输出比较：

```
Secret key is available.

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: never       usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

输出与之前基本相同，除了主密钥的 `pub` (public) 变成了 `sec` (secret)。

### 给主密钥设定新的有效期

现在，给主密钥设置（更新）一年的有效期：

```
gpg> expire
Changing expiration time for the primary key.
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Sat 02 Dec 2023 11:52:55 PM CST
Is this correct? (y/N) y

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>

gpg: WARNING: Your encryption subkey expires soon.
gpg: You may want to change its expiration date too.
```

注意到，GPG 在下方给出了一个 `WARNING`，告诉我们加密子密钥即将过期，建议更改过期时间。为了一点[前向安全性](https://unix.stackexchange.com/questions/177291/how-to-renew-an-expired-keypair-with-gpg/177310#177310)，我们在这里选择创建新的子密钥，而不是给现有的延期。

### 生成新的子密钥

首先创建一个新的用于加密的子密钥：

```
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
  (10) ECC (sign only)
  (12) ECC (encrypt only)
  (14) Existing key from card
Your selection? 6
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Sun 03 Dec 2023 12:02:17 AM CST
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
ssb  rsa4096/213C52CE5295D9B5
     created: 2022-12-02  expires: 2023-12-02  usage: E   
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

以及一个用于签名的子密钥：

```
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
  (10) ECC (sign only)
  (12) ECC (encrypt only)
  (14) Existing key from card
Your selection? 4
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
Requested keysize is 4096 bits
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Sun 03 Dec 2023 12:03:43 AM CST
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
ssb  rsa4096/213C52CE5295D9B5
     created: 2022-12-02  expires: 2023-12-02  usage: E   
ssb  rsa4096/540EA5464B638F7B
     created: 2022-12-02  expires: 2023-12-02  usage: S   
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

确认无误，保存这些修改：

```
gpg> save
```

如果你有在使用硬件密钥，可以选择在此将新创建的子密钥导入到你的硬件密钥中。注意，请根据实际情况选择密钥，例如，我需要选择新创建的用于加密的密钥，在这里是第三个子密钥，则使用 `key 3` 选择。被选中的子密钥会以 `ssb*` 标记，再次输入 `key 3` 即为取消选择。

```
gpg> key 3

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
ssb* rsa4096/213C52CE5295D9B5
     created: 2022-12-02  expires: 2023-12-02  usage: E   
ssb  rsa4096/540EA5464B638F7B
     created: 2022-12-02  expires: 2023-12-02  usage: S   
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>

gpg> keytocard
Please select where to store the key:
   (2) Encryption key
Your selection? 2

sec  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
ssb  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
     card-no: F1D0 01312EF3
ssb  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
     card-no: F1D0 01312EF3
ssb* rsa4096/213C52CE5295D9B5
     created: 2022-12-02  expires: 2023-12-02  usage: E   
ssb  rsa4096/540EA5464B638F7B
     created: 2022-12-02  expires: 2023-12-02  usage: S   
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

另一个子密钥的导入同理，完成后 `save` 保存退出即可。完成后也可再次检查密钥状态：

```shell
$ gpg --card-status
Reader ...........: 1050:0407:X:0
Application ID ...: D2760001240100000006191717900000
Application type .: OpenPGP
Version ..........: 3.4
Manufacturer .....: Yubico
Serial number ....: 19171790
Name of cardholder: Light Dawn
Language prefs ...: [not set]
Salutation .......: 
URL of public key : https://keys.openpgp.org/vks/v1/by-fingerprint/D5226A5EB826767F95C04AB3AEBAF58091A597C3
Login data .......: idawn@live.com
Signature PIN ....: not forced
Key attributes ...: rsa4096 rsa4096 rsa2048
Max. PIN lengths .: 127 127 127
PIN retry counter : 3 0 3
Signature counter : 0
KDF setting ......: off
UIF setting ......: Sign=off Decrypt=off Auth=on
Signature key ....: 28E0 52D9 01E5 1584 1619  4341 540E A546 4B63 8F7B
      created ....: 2022-12-02 16:03:34
Encryption key....: D1D0 EE6E 748E EE75 07C0  2652 213C 52CE 5295 D9B5
      created ....: 2022-12-02 15:56:50
Authentication key: [none]
General key info..: sub  rsa4096/540EA5464B638F7B 2022-12-02 Light Dawn (idawnlight) <idawn@live.com>
sec   rsa4096/AEBAF58091A597C3  created: 2018-08-02  expires: 2023-12-02
ssb>  rsa4096/5C2D7D7AE1B42692  created: 2020-08-30  expires: 2022-12-07
                                card-no: F1D0 01312EF3
ssb>  rsa4096/60F8A8EC80259079  created: 2018-08-02  expires: 2022-12-07
                                card-no: F1D0 01312EF3
ssb>  rsa4096/213C52CE5295D9B5  created: 2022-12-02  expires: 2023-12-02
                                card-no: 0006 19171790
ssb>  rsa4096/540EA5464B638F7B  created: 2022-12-02  expires: 2023-12-02
                                card-no: 0006 19171790
```

### 导出更新后的密钥

确认后，将完成轮换的公钥导出：

```shell
$ gpg --export --armor --output publickey.asc idawn@live.com
```

输出的文件类似于：

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

mQINBFtixicBEAC7kkZDG0WDSHJg2Hj2VX9R0hQdKVe6SJQ6UTH9Wq7Pq3mc3VDg
... many more lines ...
yXxsvQrSeDXixErZ6bTu9eCmqRNnte4Ola7aiFc2Avk36F91vdOfZVE=
=gtFS
-----END PGP PUBLIC KEY BLOCK-----
```

类似地，我们将主密钥的私钥导出：

```shell
$ gpg --export-secret-keys --armor --output privatekey.asc idawn@live.com
```

输出的文件类似于（任何时候都不要公开它！）：

```
-----BEGIN PGP PRIVATE KEY BLOCK-----

... some lines ...
-----END PGP PRIVATE KEY BLOCK-----
```

将私钥（或者连同公钥一起）打包，安全地保存到某个地方。之后，从你的文件系统擦除导出的私钥（使用 `shred`，尽管它[对于「现代的系统」可能没什么用](https://superuser.com/questions/617515/using-shred-from-the-command-line)）：

```
shred -u privatekey.asc
```

从本地的 keyring 中移除私钥：

```shell
$ # 如果你并没有将子密钥使用 `keytocard` 导出到硬件密钥，那么这一步并不会删除你的子密钥（显然）
$ gpg --delete-secret-keys idawn@live.com
sec  rsa4096/AEBAF58091A597C3 2018-08-02 Light Dawn (idawnlight) <idawn@live.com>

Delete this key from the keyring? (y/N) y
This is a secret key! - really delete? (y/N) y
```

最终的结果：

```shell
$ gpg --edit-key idawn@live.com
Secret subkeys are available.

pub  rsa4096/AEBAF58091A597C3
     created: 2018-08-02  expires: 2023-12-02  usage: SC  
     trust: ultimate      validity: ultimate
sub  rsa4096/5C2D7D7AE1B42692
     created: 2020-08-30  expires: 2022-12-07  usage: S   
sub  rsa4096/60F8A8EC80259079
     created: 2018-08-02  expires: 2022-12-07  usage: E   
sub  rsa4096/213C52CE5295D9B5
     created: 2022-12-02  expires: 2023-12-02  usage: E   
sub  rsa4096/540EA5464B638F7B
     created: 2022-12-02  expires: 2023-12-02  usage: S   
[ultimate] (1). Light Dawn (idawnlight) <idawn@live.com>
```

### 发布新的公钥

与原文不同，我在此将发布移至了最后一步，以便于有更多的机会发现意外的操作失误。事实上，大多数传统的公钥服务器 KeyServer 并没有得到很好的维护，发布到 SKS Pool 并不是必要的（除非此前已经发布过）。如果你确实想这样做：

```shell
$ gpg --send-keys 0xAEBAF58091A597C3
$ gpg --send-keys --keyserver pgp.mit.edu 0xAEBAF58091A597C3
$ gpg --send-keys --keyserver keyserver.ubuntu.com 0xAEBAF58091A597C3
```

我个人会更推荐使用 [keys.openpgp.org](https://keys.openpgp.org/)。不同于传统的 KeyServer，它会要求对邮件地址验证后才能根据邮件地址查找公钥，且每个邮件地址只能对应一个公钥。同时，提供了删除已上传的身份的选项。要上传一个公钥同样非常简单：

```shell
$ gpg --export idawn@live.com | curl -T - https://keys.openpgp.org
Key successfully uploaded. Proceed with verification here:
https://keys.openpgp.org/upload/[verification_token]
```

此外，别忘了更新 GitHub / GitLab 以及其它一些服务上的公钥，还有 Git 等的配置。

> 很不幸的是，GitHub [至今仍不支持更新公钥](https://www.hjdskes.nl/blog/psa-github-gpg/)，所以你只能删除后重新添加 :(

[^footnote-example]: 这是一个脚注的示例。
[^1]: 我之前并没有设定有效期，但会在这篇文章中设置一下。
[^subkey]: 如果你正在使用硬件密钥（YubiKey、CanoKey 或其他类似产品），通常情况下子密钥应该仅有一份保存在硬件密钥中。
[^2]: 如果直接将子密钥导入硬件密钥，并无必要额外保存子密钥。
[^3]: 我之前是把主密钥加密后放在 OneDrive 上的，然后当我写这篇文章准备把密钥取回来的时候，OneDrive 网页版[恰好寄了](https://twitter.com/MSFT365Status/status/1588022364784267265)...（503，`x-azure-externalerror: 0x80072ee2,OriginTimeout`，Fri Dec 02 2022 20:40:00 GMT+0800）
