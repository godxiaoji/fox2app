| 钩子         | 说明                      | 参数              | 类型 |
| ------------ | ------------------------- | ----------------- | ---- |
| afterPlugins | 启动一次新的编译          | compiler          | 同步 |
| compile      | 创建 compilation 对象之前 | compilationParams | 同步 |
| compilation  | compilation 对象创建完成  | compilation       | 同步 |
| emit         | 资源生成完成，输出之前    | compilation       | 异步 |
| afterEmit    | 资源输出到目录完成        | compilation       | 异步 |
| done         | 完成编译                  | stats             | 同步 |

shouldEmit: [SyncBailHook],
done: [AsyncSeriesHook],
additionalPass: [AsyncSeriesHook],
beforeRun: [AsyncSeriesHook],
run: [AsyncSeriesHook],
emit: [AsyncSeriesHook],
assetEmitted: [AsyncSeriesHook],
afterEmit: [AsyncSeriesHook],
thisCompilation: [SyncHook],
compilation: [SyncHook],
normalModuleFactory: [SyncHook],
contextModuleFactory: [SyncHook],
beforeCompile: [AsyncSeriesHook],
compile: [SyncHook],
make: [AsyncParallelHook],
afterCompile: [AsyncSeriesHook],
watchRun: [AsyncSeriesHook],
failed: [SyncHook],
invalid: [SyncHook],
watchClose: [SyncHook],
infrastructureLog: [SyncBailHook],
environment: [SyncHook],
afterEnvironment: [SyncHook],
afterPlugins: [SyncHook],
afterResolvers: [SyncHook],
entryOption: [SyncBailHook],
infrastructurelog: [SyncBailHook]
