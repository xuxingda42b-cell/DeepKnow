import { defineComponent, ref } from 'vue'

export const TheTab = defineComponent({
  name: 'TheTab',
  setup(props, { emit }) {
    const tabs = ['推荐', '热门', '最新']
    const activeTab = ref('推荐')

    const handleTabClick = (tab: string) => {
      activeTab.value = tab
      emit('change', tab)
    }

    return () => (
      <div class="border-b border-gray-100 bg-white px-4 sticky top-14 z-40">
        <nav class="-mb-px flex space-x-6 max-w-4xl mx-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              onClick={() => handleTabClick(tab)}
              class={[
                activeTab.value === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]}
              aria-current={activeTab.value === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    )
  }
})
