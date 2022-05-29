import Icon from '@/web/components/Icon'
import useScroll from '@/web/hooks/useScroll'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { cx } from '@emotion/css'

const NavigationButtons = () => {
  const navigate = useNavigate()
  enum ACTION {
    Back = 'back',
    Forward = 'forward',
  }
  const handleNavigate = (action: ACTION) => {
    if (action === ACTION.Back) navigate(-1)
    if (action === ACTION.Forward) navigate(1)
  }
  return (
    <div className='flex gap-1'>
      {[ACTION.Back, ACTION.Forward].map(action => (
        <div
          onClick={() => handleNavigate(action)}
          key={action}
          className='app-region-no-drag btn-hover-animation rounded-lg p-2 text-gray-500 transition duration-300 after:rounded-full after:bg-black/[.06] hover:text-gray-900 dark:text-gray-300 dark:after:bg-white/10 dark:hover:text-gray-200'
        >
          <Icon className='h-5 w-5' name={action} />
        </div>
      ))}
    </div>
  )
}

const SearchBox = () => {
  const { type } = useParams()
  const [keywords, setKeywords] = useState('')
  const navigate = useNavigate()
  const toSearch = (e: React.KeyboardEvent) => {
    if (!keywords) return
    if (e.key === 'Enter') {
      navigate(`/search/${keywords}${type ? `/${type}` : ''}`)
    }
  }

  return (
    <div className='app-region-no-drag group flex w-[16rem] cursor-text items-center rounded-full bg-gray-500 bg-opacity-5 pl-2.5 pr-2 transition duration-300 hover:bg-opacity-10 dark:bg-gray-300 dark:bg-opacity-5'>
      <Icon
        className='mr-2 h-4 w-4 text-gray-500 transition duration-300 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-200'
        name='search'
      />
      <input
        value={keywords}
        onChange={e => setKeywords(e.target.value)}
        onKeyDown={toSearch}
        type='text'
        className='flex-grow bg-transparent placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400'
        placeholder='搜索'
      />
      <div
        onClick={() => setKeywords('')}
        className={cx(
          'cursor-default rounded-full p-1 text-gray-600  transition hover:bg-gray-400/20 dark:text-white/50 dark:hover:bg-white/20',
          !keywords && 'hidden'
        )}
      >
        <Icon className='h-4 w-4' name='x' />
      </div>
    </div>
  )
}

const Settings = () => {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate('/settings')}
      className='app-region-no-drag btn-hover-animation rounded-lg p-2.5 text-gray-500 transition duration-300 after:rounded-full after:bg-black/[.06] hover:text-gray-900 dark:text-gray-300 dark:after:bg-white/10 dark:hover:text-gray-200'
    >
      <Icon className='h-[1.125rem] w-[1.125rem]' name='settings' />
    </div>
  )
}

const Topbar = () => {
  /**
   * Show topbar background when scroll down
   */
  const [mainContainer, setMainContainer] = useState<HTMLElement | null>(null)
  const scroll = useScroll(mainContainer, { throttle: 100 })

  useEffect(() => {
    setMainContainer(document.getElementById('mainContainer'))
  }, [setMainContainer])

  return (
    <div
      className={cx(
        'sticky z-30 flex h-16 min-h-[4rem] w-full cursor-default items-center justify-between px-8 transition duration-300',
        window.env?.isMac && 'app-region-drag',
        window.env?.isEnableTitlebar ? 'top-8' : 'top-0',
        !scroll.arrivedState.top &&
          'bg-white bg-opacity-[.86] backdrop-blur-xl backdrop-saturate-[1.8] dark:bg-[#222] dark:bg-opacity-[.86]'
      )}
    >
      <div className='flex gap-2'>
        <NavigationButtons />
        <SearchBox />
      </div>

      <div className='flex items-center gap-3'>
        <Settings />
        <Avatar />
      </div>
    </div>
  )
}

export default Topbar
