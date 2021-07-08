# 问题记录

## input readonly 属性结合 placeholder 引发的复制失效问题

一开始以为是事件监听或者复制行为被干扰，后来在 github issues 里发现是 placeholder 的问题。再次合理推测是选区显示选中文字但是实际没有选中，后来调用`window.getSelecton().toString()`api查看文字实际是被选中的。


![wecom-temp-7342b0f7db89b06a9f1155cf419db8ca.png](https://i.loli.net/2021/06/04/2jtoSfr5El39OFh.png)

结论：比较罕见的 bug，由于不同浏览器实现 input 的策略不一样（chrome 的不同版本行为也不一致）导致的。复现成本较大。

解决方式：取消 placeholder 后即可，因为手机号码实际是由接口带出的，所以没有影响。后续可以持续观察这个罕见的问题 

