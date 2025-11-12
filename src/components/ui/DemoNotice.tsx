import React from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { isConfigured } from '../../lib/supabase'

const DemoNotice: React.FC = () => {
  if (isConfigured) return null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            🚀 Demo Mode - Ready for Supabase Setup
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            KR STORES is running with sample data. To enable full e-commerce functionality (orders, payments, admin panel), set up Supabase:
          </p>
          <div className="bg-amber-100 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-amber-800 mb-2">Quick Setup (5 minutes):</p>
            <ol className="text-sm text-amber-700 space-y-1 ml-4 list-decimal">
              <li>Create free account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900 font-medium">supabase.com</a></li>
              <li>Create new project → Get URL & API key</li>
              <li>Run SQL migrations in Supabase SQL Editor</li>
              <li>Add credentials to environment variables</li>
            </ol>
          </div>
          </ol>
          <a 
            href="/SUPABASE_SETUP.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-amber-600 hover:text-amber-800 font-medium bg-white px-3 py-1 rounded border border-amber-200"
          >
            📋 View Complete Setup Guide
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default DemoNotice