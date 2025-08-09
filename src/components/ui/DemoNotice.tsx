import React from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'

const DemoNotice: React.FC = () => {
  const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

  if (hasSupabaseConfig) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Demo Mode - Supabase Not Configured
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            This application is currently running with mock data. To enable full functionality with database persistence, please set up Supabase:
          </p>
          <ol className="text-sm text-blue-700 space-y-1 mb-3 ml-4 list-decimal">
            <li>Create a free Supabase account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">supabase.com</a></li>
            <li>Create a new project and get your URL and anon key</li>
            <li>Run the provided SQL migrations to create the database schema</li>
            <li>Add your Supabase credentials to the environment variables</li>
          </ol>
          <a 
            href="https://github.com/your-repo/kr-stores#supabase-setup" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View Setup Instructions
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default DemoNotice