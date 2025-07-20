import React from 'react'
import { Card, Text, makeStyles } from '@fluentui/react-components'

const useStyles = makeStyles({
  container: {
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
    paddingLeft: '200px',
    width: 'calc(100% - 200px)'
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    backdropFilter: 'blur(20px)',
    padding: '0.75rem',
    width: '100%',
    minHeight: '100%',
    boxShadow: '0 0 10px 2px rgba(100, 149, 237, 0.1)',
    marginLeft: '0.5rem'
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
    marginBottom: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderBottom: '1px solid rgba(100, 149, 237, 0.3)',
    width: '100%',
    display: 'block'
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
          {title}
        </Text>
        {children}
      </Card>
    </div>
  )
}

export default PanelLayout
