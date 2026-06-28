import React, { useState } from 'react'

const SearchBar = ({ onSearch }: { onSearch: (value: string) => void }) => {

  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Search by name, email or company..."
      style={{
        width: "300px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none",
        marginBottom: "16px"
      }}
    />
  )
}

export default SearchBar
