import React, { useContext, useEffect, useRef, useState } from 'react'

import { DevModeContext } from '@/contexts/DevModeContext.js'
import { ModalContext } from '@/contexts/ModalContext.js'

import Switch from '@/components/Switch/Switch.js'

import styles from './Settings.module.css'

import icon from '@/assets/icon.png'

enum Tab {
  General,
  Client,
  Appearance,
  Startup,
  Advanced,
  About
}

const Settings: React.FC = () => {
  const { settingsOpen, setSettingsOpen } = useContext(ModalContext)
  const { devMode } = useContext(DevModeContext)

  const [currentTab, setCurrentTab] = useState<Tab>(Tab.General)

  function onClickBackground(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) setSettingsOpen(false)
  }

  useEffect(() => {
    if (!settingsOpen && currentTab !== Tab.General) {
      setTimeout(() => setCurrentTab(Tab.General), 200)
    }
  }, [settingsOpen, currentTab])

  useEffect(() => {
    if (!devMode && currentTab === Tab.Advanced) setCurrentTab(Tab.General)
  })

  return (
    <div
      className={styles.settings}
      data-open={settingsOpen}
      onClick={onClickBackground}
    >
      <div className={styles.box}>
        <h2>
          Settings
          <button onClick={() => setSettingsOpen(false)}>
            <span className="material-icons">close</span>
          </button>
        </h2>
        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              onClick={() => setCurrentTab(Tab.General)}
              data-active={currentTab === Tab.General}
            >
              <span className="material-icons">settings</span>
              General
            </button>
            <button
              onClick={() => setCurrentTab(Tab.Client)}
              data-active={currentTab === Tab.Client}
            >
              <span className="material-icons">devices</span>
              Client
            </button>
            <button
              onClick={() => setCurrentTab(Tab.Appearance)}
              data-active={currentTab === Tab.Appearance}
            >
              <span className="material-icons">palette</span>
              Appearance
            </button>
            <button
              onClick={() => setCurrentTab(Tab.Startup)}
              data-active={currentTab === Tab.Startup}
            >
              <span className="material-icons">security</span>
              Startup
            </button>
            {devMode ? (
              <button
                onClick={() => setCurrentTab(Tab.Advanced)}
                data-active={currentTab === Tab.Advanced}
              >
                <span className="material-icons">code</span>
                Advanced
              </button>
            ) : null}
            <button
              onClick={() => setCurrentTab(Tab.About)}
              data-active={currentTab === Tab.About}
            >
              <span className="material-icons">info</span>
              About
            </button>
          </div>
          <div className={styles.tab}>
            {currentTab === Tab.General ? (
              <GeneralTab />
            ) : currentTab === Tab.Client ? (
              <ClientTab />
            ) : currentTab === Tab.Appearance ? (
              <AppearanceTab />
            ) : currentTab === Tab.Startup ? (
              <StartupTab />
            ) : currentTab === Tab.Advanced ? (
              <AdvancedTab />
            ) : currentTab === Tab.About ? (
              <AboutTab />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

const ToggleSetting: React.FC<{
  label: string
  description?: string
  defaultValue?: boolean
  value?: boolean
  onChange: (value: boolean) => void
}> = ({ label, description, defaultValue, value, onChange }) => {
  return (
    <div className={styles.toggleSetting}>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <Switch
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

const InputWithSubmitSetting: React.FC<{
  label: string
  description?: string
  defaultValue?: string
  value?: string
  submitLabel?: string
  onSubmit: (value: string) => void
  password?: boolean
  disabled?: boolean
}> = ({
  label,
  description,
  defaultValue,
  submitLabel,
  onSubmit,
  password,
  disabled
}) => {
  const value = useRef('')

  return (
    <div className={styles.inputWithSubmitSetting}>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.form}>
        <input
          type={password ? 'password' : 'text'}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={e => (value.current = e.target.value)}
        />
        <button
          disabled={disabled}
          onClick={() => onSubmit(value.current || '')}
        >
          {submitLabel || 'Submit'}
        </button>
      </div>
    </div>
  )
}

const SelectSetting: React.FC<{
  label: string
  description?: string
  defaultValue?: string
  value?: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}> = ({ label, description, defaultValue, value, options, onChange }) => {
  return (
    <div className={styles.selectSetting}>
      <div className={styles.text}>
        <p className={styles.label}>{label}</p>
        <p className={styles.description}>{description}</p>
      </div>
      <select
        defaultValue={defaultValue}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

enum SpotifyStatus {
  Loading,
  Pending,
  Valid,
  Invalid
}

const GeneralTab: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const [spotifyStatus, setSpotifyStatus] = useState<SpotifyStatus>(
    SpotifyStatus.Pending
  )

  const settings = useRef<{
    installAutomatically?: boolean
    sp_dc?: string
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        installAutomatically:
          (await window.api.getStorageValue('installAutomatically')) ===
          true
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  async function handleSpotifyTokenChange(token: string) {
    setSpotifyStatus(SpotifyStatus.Loading)
    if (!token) return setSpotifyStatus(SpotifyStatus.Invalid)
    const res = await window.api.setSpotifyToken(token)

    if (res === false) {
      setSpotifyStatus(SpotifyStatus.Invalid)
    } else {
      setSpotifyStatus(SpotifyStatus.Valid)
    }
  }

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <ToggleSetting
          label="Install Automatically"
          description="Automatically installs the web app to the CarThing when it is connected."
          defaultValue={settings.current.installAutomatically ?? false}
          onChange={value =>
            window.api.setStorageValue('installAutomatically', value)
          }
        />
        <InputWithSubmitSetting
          label="Spotify Token"
          description="Used for live fetching of Spotify playback status"
          password
          defaultValue=""
          disabled={spotifyStatus === SpotifyStatus.Loading}
          onSubmit={handleSpotifyTokenChange}
          submitLabel="Change"
        />
        {spotifyStatus === SpotifyStatus.Invalid ? (
          <p className={styles.error}>Invalid Spotify token</p>
        ) : spotifyStatus === SpotifyStatus.Valid ? (
          <p className={styles.success}>Token saved!</p>
        ) : null}
      </div>
    )
  )
}

const ClientTab: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    timeFormat?: string
    dateFormat?: string
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        timeFormat: ((await window.api.getStorageValue('timeFormat')) ||
          'HH:mm') as string,
        dateFormat: ((await window.api.getStorageValue('dateFormat')) ||
          'ddd, D MMM') as string
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  function handleTimeFormatChange(value: string) {
    window.api.setStorageValue('timeFormat', value)
  }

  function handleDateFormatChange(value: string) {
    window.api.setStorageValue('dateFormat', value)
  }

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <SelectSetting
          label="Time Format"
          description="Displayed time format in the titlebar"
          defaultValue={settings.current.timeFormat}
          options={[
            { value: 'HH:mm', label: '24-hour' },
            { value: 'h:mm A', label: '12-hour' }
          ]}
          onChange={handleTimeFormatChange}
        />
        <SelectSetting
          label="Date Format"
          description="Displayed date format in the titlebar"
          defaultValue={settings.current.dateFormat}
          options={[
            { value: 'ddd, D MMM', label: 'Short' },
            { value: 'dddd, D MMMM', label: 'Long' }
          ]}
          onChange={handleDateFormatChange}
        />
      </div>
    )
  )
}

const AppearanceTab: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (darkMode === false) {
      setTimeout(() => {
        setDarkMode(true)
      }, 100)
    }
  }, [darkMode])

  return (
    <div className={styles.settingsTab}>
      <ToggleSetting
        label="Dark mode"
        description={
          darkMode ? 'Enable dark mode for the app.' : 'sike u thought'
        }
        value={darkMode}
        onChange={value => setDarkMode(value)}
      />
    </div>
  )
}

const StartupTab: React.FC = () => {
  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    launchOnStartup?: boolean
    launchMinimized?: boolean
    installOnStartup?: boolean
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        launchOnStartup:
          (await window.api.getStorageValue('launchOnStartup')) === true,
        launchMinimized:
          (await window.api.getStorageValue('launchMinimized')) === true
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <ToggleSetting
          label="Launch on startup"
          description="Starts the app when you log in. This will also start the server."
          defaultValue={settings.current.launchOnStartup ?? false}
          onChange={value =>
            window.api.setStorageValue('launchOnStartup', value)
          }
        />
        <ToggleSetting
          label="Launch minimized"
          description="Starts the app minimized in the system tray."
          defaultValue={settings.current.launchMinimized ?? false}
          onChange={value =>
            window.api.setStorageValue('launchMinimized', value)
          }
        />
      </div>
    )
  )
}

const AdvancedTab: React.FC = () => {
  const { setDevMode } = useContext(DevModeContext)
  const [loaded, setLoaded] = useState(false)
  const settings = useRef<{
    disableSocketAuth?: boolean
  }>({})

  useEffect(() => {
    async function loadSettings() {
      settings.current = {
        disableSocketAuth:
          (await window.api.getStorageValue('disableSocketAuth')) === true
      }
      setLoaded(true)
    }

    loadSettings()
  }, [])

  return (
    loaded && (
      <div className={styles.settingsTab}>
        <ToggleSetting
          label="Developer Mode"
          description="Enables some options for development purposes."
          defaultValue={true}
          onChange={() => setDevMode(false)}
        />
        <ToggleSetting
          label="Disable WebSocket Authentication"
          description="Allows connections to the WebSocket server without authentication."
          defaultValue={settings.current.disableSocketAuth ?? false}
          onChange={value =>
            window.api.setStorageValue('disableSocketAuth', value)
          }
        />
      </div>
    )
  )
}

const AboutTab: React.FC = () => {
  const { devMode, setDevMode } = useContext(DevModeContext)
  const [version, setVersion] = useState<string | null>(null)
  const [timesClicked, setTimesClicked] = useState(0)

  useEffect(() => {
    window.api.getVersion().then(setVersion)
  }, [])

  useEffect(() => {
    if (timesClicked <= 0) return

    if (devMode) return

    if (timesClicked >= 5) setDevMode(true)
  }, [timesClicked])

  return (
    <div className={styles.aboutTab}>
      <div className={styles.app}>
        <img src={icon} alt="" />
        <div className={styles.info}>
          <h2>GlanceThing</h2>
          <p
            onClick={() => setTimesClicked(t => (t += 1))}
            className={styles.version}
          >
            Version {version}
          </p>
        </div>
      </div>
      <h2>Credits</h2>
      <div className={styles.credit}>
        <img src="https://api.bludood.com/avatar?size=48" alt="" />
        <div className={styles.info}>
          <a href="https://bludood.com" target="_blank" rel="noreferrer">
            BluDood
          </a>
          <p>GlanceThing Developer</p>
        </div>
      </div>
      <div className={styles.credit}>
        <img
          src="https://avatars.githubusercontent.com/u/131838720?size=48"
          alt=""
        />
        <div className={styles.info}>
          <a
            href="https://github.com/ItsRiprod"
            target="_blank"
            rel="noreferrer"
          >
            ItsRiprod
          </a>
          <p>Developer of DeskThing, heavily inspired this project</p>
        </div>
      </div>
    </div>
  )
}

export default Settings
