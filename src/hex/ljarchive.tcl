
# ljarchive.tcl
# 2024-07-19 | eaton | Initial implementation

proc recordCount {} {
  set mark [uint8]
  set id [uint8]
  set spacer [uint64]
  set len [uint32]
  set five [uint8]
  for {set i 1} {$i <= $len} {incr i} {
    move 5
  }
  return $len
}

proc reverse_leb128 {} {
  set start [pos]
  set byte 128
  for {set shift 0} {$byte & 0x80} {incr shift 7} {
    set	byte [uint8]
    incr number [expr ($byte & 127) << $shift]
  }
  return $number
}

proc shortStr {label} {
  set len [reverse_leb128]
  if { $len > 0 } {
    if {[llength $label] == 0} {
      move $len
    } else {
      str $len "utf8" $label
    }
  }
}

proc varStr {label} {
  # Mark is "06" for populated or "09" for empty
  set pre [uint8]
  set id [uint32]
  if { $pre == 6 } {
    set len [reverse_leb128]
    if { $len > 0 } {
      str $len "utf8" $label
    }
  }
}

proc timestamp {label} {
  # Mark is "080D"
  set mark [uint16]
  uint64 $label
}

proc bool {label} {
  # Mark is "0801"
  move 2
  uint8_bits 0 $label
}

proc entityID {label} {
  # Mark is "0808"
  set mark [uint16]
  uint32 $label
}

proc recordStart {args} {
  # Mark is "10"
  set mark [uint8]

  if { [llength $args] == 0 } {
    move 8
  } else {
    section -collapsed "Meta" {
      uint32 "RecordID"
      uint32 "FieldCount"
    }
  }
}

section "Meta" {
  requires 0 "0001000000FFFFFFFF01000000000000000C02000000"
  move 22 
  shortStr "Assembly"
  move 5
  shortStr "ClassName"

  set classCount [uint32]
  for {set i 1} {$i <= $classCount} {incr i} {
    shortStr ""
  }
  for {set i 1} {$i <= $classCount} {incr i} {
    move 1
  }
  for {set i 1} {$i <= $classCount} {incr i} {
    shortStr ""
  }
  move 4
  for {set i 1} {$i <= $classCount} {incr i} {
    shortStr ""
  }

  move 10

  set moodCount [recordCount]
  set userPicCount [recordCount]
  set userCount [recordCount]
  set entryCount [recordCount]
  set commentCount [recordCount]

  entry "Moods" $moodCount
  entry "UserPics" $userPicCount
  entry "Users" $userCount
  entry "Entries" $entryCount
  entry "Comments" $commentCount
}

section "Options" {
  recordStart
  varStr "ServerURL"
  varStr "DefaultPicURL"
  varStr "FullName"
  varStr "UserName"
  varStr "HPassword"
  timestamp "Last Sync"
  bool "Unknown"
}

section -collapsed "Moods" {
  for {set m 1} {$m <= $moodCount} {incr m} {
    recordStart
    entityID "MoodID"
    varStr "Name"
    entityID "NextMoodID"
  }
}

section -collapsed "UserPics" {
  for {set u 1} {$u <= $userPicCount} {incr u} {
    recordStart
    varStr "Keyword"
    varStr "URL"
  }
}

section -collapsed "Users" {
  for {set u 1} {$u <= $userCount} {incr u} {
    recordStart
    entityID "UserID"
    varStr "Name"
  }
}

section -collapsed "Events" {
  for {set u 1} {$u <= $entryCount} {incr u} {
	  section "Event $u" {
      recordStart
      entityID "ID"
      timestamp "Date"
      varStr "Security"
      entityID "Audience"
      varStr "Subject"
      varStr "Body"
      varStr "Unknown"
      varStr "Custom Mood"
      entityID MoodID
      varStr "Music"
      bool "Preformatted"
      bool "No Comments"
      varStr "UserPic"
      bool "Unknown Bool"
      bool "Backdated"
      bool "No Email"
      bool "Unknown"
      entityID "Revisions"
      entityID "CommentAlter"
      varStr "Syndication URL"
      varStr "Syndication ID"
      timestamp "LastMod"
	  }
	}
}

section -collapsed "Comments" {
  for {set u 1} {$u <= $commentCount} {incr u} {
    section -collapsed "Comment $u" {
      recordStart
      entityID "CommentID"
      entityID "UserID"
      varStr "UserName"
      entityID "EntryID"
      entityID "ParentID"
      varStr "Body"
      varStr "Subject"
      timestamp "Date"
    }
  }
}
