export interface Question {
  id: string
  title: string
  description: string
  tags: { name: string; color: string }[]
  author: {
    name: string
    avatar: string
  }
  time: string
  category: string
  answersCount: number
  viewsCount: number
  isResolved: boolean
}

export const questionsData: Question[] = [
  {
    id: '1',
    title: '如何在 Vue 3 中使用 TSX 编写函数式组件？',
    description: '我正在学习 Vue 3，之前习惯了使用 .vue 单文件组件的方式。但是看文档说也可以像 React 一样使用 JSX/TSX 来编写函数式组件。这在实际项目中有什么优缺点？能否给一个具体的、包含 props 和 emits 的例子参考呢？',
    tags: [
      { name: '前端', color: 'bg-blue-100 text-blue-700' },
      { name: 'Vue 3', color: 'bg-green-100 text-green-700' },
      { name: 'TypeScript', color: 'bg-indigo-100 text-indigo-700' },
    ],
    author: {
      name: '前端小菜鸟',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    time: '2026-04-14 16:50:00',
    category: '技术问答',
    answersCount: 3,
    viewsCount: 1204,
    isResolved: true,
  },
  {
    id: '2',
    title: '目前市面上有哪些比较好的自由职业接单平台推荐？',
    description: '做了几年的后端开发，现在想尝试一下自由职业。不知道有没有一些靠谱的接单平台可以推荐？或者是如何通过个人品牌来获取客户？希望有经验的前辈们能分享一下你们的打法。',
    tags: [
      { name: '生活', color: 'bg-orange-100 text-orange-700' },
      { name: '自由职业', color: 'bg-yellow-100 text-yellow-700' },
    ],
    author: {
      name: '后端老兵',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
    },
    time: '2026-04-14 13:50:00',
    category: '职场与生活',
    answersCount: 0,
    viewsCount: 3500,
    isResolved: false,
  },
  {
    id: '3',
    title: 'Python 处理百万级数据时，Pandas 内存占用过大的问题如何解决？',
    description: '在处理一份大约 500 万行的 CSV 文件时，使用 pandas.read_csv 直接读取会导致系统内存爆满被 kill。查阅了一些资料，有的推荐使用 chunksize 分块读取，有的推荐用 dask。想请教在实际生产中，哪种方案更加稳定且效率高？',
    tags: [
      { name: '后端', color: 'bg-red-100 text-red-700' },
      { name: 'Python', color: 'bg-yellow-100 text-yellow-700' },
      { name: '数据分析', color: 'bg-purple-100 text-purple-700' },
    ],
    author: {
      name: '数据爱好者',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
    },
    time: '2026-04-13 18:50:00',
    category: '技术问答',
    answersCount: 0,
    viewsCount: 856,
    isResolved: false,
  },
  {
    id: '4',
    title: '这周末有没有人想一起去爬山？',
    description: '',
    tags: [
      { name: '生活', color: 'bg-orange-100 text-orange-700' },
      { name: '交友', color: 'bg-pink-100 text-pink-700' },
    ],
    author: {
      name: '爬山达人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger',
    },
    time: '2026-04-12 18:50:00',
    category: '闲聊吐槽',
    answersCount: 0,
    viewsCount: 50,
    isResolved: false,
  }
]
