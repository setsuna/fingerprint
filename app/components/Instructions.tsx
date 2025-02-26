export default function Instructions() {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8 p-4">
        <h2 className="text-xl font-semibold mb-2">操作说明:</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>插入指纹设备</li>
          <li>点击"取特征",将手指放在指纹仪采集仪上即可</li>
          <li>开发源码查看：右击鼠标选择"查看源代码"</li>
        </ol>
      </div>
    )
  }