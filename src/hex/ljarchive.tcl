
# ljarchive.tcl
# 2024-07-19 | eaton | Initial implementation
# https://sourceforge.net/projects/ljarchive/

# LJArchive is basically just the .Net 3.5 Binary serializer in action.
# Figuring that out simplified quite a bit of subsequent testing, but it
# also means this is incredibly vulnerable to minor version updates that
# change the internal storage format of any field. This was built against
# data from the 0.9.4.3 release; anything else is a Buyer Beware kind of
# situation.

# Field type prefix bytes
#
# 0x06 - 4-byte Field ID, then a variable-length string
# 0x07 - Internal record metadata (see recordCount)
# 0x0801 - Boolean (single byte with 0 or 1)
# 0x0808 - 4-byte EntityID
# 0x080D - 8-byte timestamp in ticks
# 0x09 - 4-byte FieldID for an empty variable-length string
# 0x10 - Record header (see recordStart)

# LJArchive stores its strings in vanilla UTF, but encodes the length
# as LEB128 ints. This is baffling when trying to figure out the format,
# but ends up pretty elegant in the end: once a string field is found,
# read LEB bytes until something with the high bit appears (aka, utf8
# text). No other fancy footwork is necessary to distinguish length
# data from text data. 
proc reverse_leb128 {} {
  set start [pos]
  set byte 128
  for {set shift 0} {$byte & 0x80} {incr shift 7} {
    set	byte [uint8]
    incr number [expr ($byte & 127) << $shift]
  }
  return $number
}

# A handful of strings in the header are variable-length but
# not actually data fields, and require special handling.
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

# The catch-all parser for string fields.
proc varStr {label} {
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
