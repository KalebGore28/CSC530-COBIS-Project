"use client"

import { useState } from "react"

const StudentFilter = () => {
  const [academicLevels, setAcademicLevels] = useState([])
  const [gpaRange, setGpaRange] = useState([0, 4.0])
  const [selectedMajors, setSelectedMajors] = useState([])
  const [selectedMinors, setSelectedMinors] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  // Sample data for visualization purposes, will be replaced with API calls
  const academicLevelOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Post-Graduate"]
  const majorOptions = [
    "Computer Science",
    "Cybersecurity & Network Management",
    "Some other major",
    "Economics",
    "Finance"
  ]
  const minorOptions = [
    "Game Development",
    "Data Analytics",
    "Finance",
    "Some other minor"
  ]

  const handleAcademicLevelChange = (level) => {
    setAcademicLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  const handleMajorChange = (major) => {
    setSelectedMajors((prev) => (prev.includes(major) ? prev.filter((m) => m !== major) : [...prev, major]))
  }

  const handleMinorChange = (minor) => {
    setSelectedMinors((prev) => (prev.includes(minor) ? prev.filter((m) => m !== minor) : [...prev, minor]))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Student Filters</h3>
        <button
          className="text-blue-950 hover:text-blue-800 text-sm font-medium flex items-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`${showFilters ? "block" : "hidden"}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Filtering based on student academic level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Level</label>
            <div className="space-y-2">
              {academicLevelOptions.map((level) => (
                <label key={level} className="inline-flex items-center mr-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
                    checked={academicLevels.includes(level)}
                    onChange={() => handleAcademicLevelChange(level)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtering based on student GPA ranges */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPA Range: {gpaRange[0].toFixed(1)} - {gpaRange[1].toFixed(1)}
            </label>
            <div className="px-2 space-y-4">
              {/* Minimum GPA slider */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-8">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="4.0"
                  step="0.1"
                  value={gpaRange[0]}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    setGpaRange([value, Math.max(value, gpaRange[1])])
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-950"
                />
                <span className="text-xs font-medium w-8">{gpaRange[0].toFixed(1)}</span>
              </div>

              {/* Maximum GPA slider */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-8">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="4.0"
                  step="0.1"
                  value={gpaRange[1]}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    setGpaRange([Math.min(gpaRange[0], value), value])
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-950"
                />
                <span className="text-xs font-medium w-8">{gpaRange[1].toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Filtering based on student majors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Major</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {majorOptions.map((major) => (
                <label key={major} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
                    checked={selectedMajors.includes(major)}
                    onChange={() => handleMajorChange(major)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{major}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtering based on student minors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minor</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {minorOptions.map((minor) => (
                <label key={minor} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-950 focus:ring-blue-950"
                    checked={selectedMinors.includes(minor)}
                    onChange={() => handleMinorChange(minor)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{minor}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-end gap-3 mt-6">
          {/* Reset Filters Button */}
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium"
            onClick={() => {
              setAcademicLevels([])
              setGpaRange([0, 4.0])
              setSelectedMajors([])
              setSelectedMinors([])
            }}
          >
            Reset Filters
          </button>
          <button className="px-4 py-2 bg-blue-950 text-white rounded-md hover:bg-blue-900 text-sm font-medium"
          onClick={() => {
            alert("This will later be functional")
          }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentFilter

