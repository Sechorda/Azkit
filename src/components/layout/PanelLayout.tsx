import React from 'react'
import { Card, Text, makeStyles } from '@fluentui/react-components'

const useStyles = makeStyles({
  container: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh'
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    backdropFilter: 'blur(20px)',
    padding: 0,
    width: '100%',
    minHeight: '100%',
    boxShadow: 'none',
    border: 'none'
  },
  property: {
    marginBottom: '0.5rem'
  },
  label: {
    fontWeight: '600',
    marginRight: '0.5rem',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  value: {
    color: 'rgba(255, 255, 255, 0.8)'
  },
  title: {
    color: 'rgba(255, 255, 255, 0.95)',
    margin: 0,
    padding: 0,
    background: 'transparent',
    boxSizing: 'border-box',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    borderBottom: '1px solid rgba(100, 149, 237, 0.8)'
  },
  titleContent: {
    display: 'block',
    padding: '1rem',
    lineHeight: '39px'
  },
  body: {
    /* Keep content tight to the header border to avoid any perceived second line */
    padding: '0 0.75rem 0.75rem 0.75rem'
  }
})

interface PanelLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PanelLayout: React.FC<PanelLayoutProps> = ({ title, children }) => {
  const styles = useStyles()
  console.log('PanelLayout rendering with title:', title)

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Text size={600} as="h2" block className={styles.title}>
          <span className={styles.titleContent}>{title}</span>
        </Text>
        <div className={styles.body}>
          {children}
        </div>
      </Card>
    </div>
  )
}

export default PanelLayout
