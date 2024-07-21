
# ljarchive.tcl
# 2024-07-19 | eaton | Initial implementation
# https://sourceforge.net/projects/ljarchive/

# LJArchive format is basically just the .Net 3.5 Binary serializer.
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

# LJArchive stores its strings in vanilla UTF, prefixed by the length
# in LEB128. This is baffling when trying to figure out the file structure,
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
  # Mark is 07
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
    section -collapsed "meta" {
      uint32 "RecordID"
      uint32 "FieldCount"
    }
  }
}

# It's highly likely that this will break with archive files saved by
# anything other than LJArchive 0.9.4.3. If things change TOO much,
# this meta/header section is likely to choke first. So, while it
# doesn't add much other than record counts, it's a useful canary
# in the metaphorical coal mine.
section "header" {
  requires 0 "0001000000FFFFFFFF01000000000000000C02000000"
  move 22 
  shortStr "assembly"
  move 5
  shortStr "className"

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

  entry "moods" $moodCount
  entry "userpics" $userPicCount
  entry "users" $userCount
  entry "events" $entryCount
  entry "comments" $commentCount
}

section "options" {
  recordStart
  varStr "serverURL"
  varStr "defaultPicURL"
  varStr "fullName"
  varStr "userName"
  varStr "password"
  timestamp "lastSynced"
  bool "unknown"
}

section -collapsed "moods" {
  for {set m 1} {$m <= $moodCount} {incr m} {
    recordStart
    entityID "id"
    varStr "name"
    entityID "parentId"
  }
}

section -collapsed "userpics" {
  for {set u 1} {$u <= $userPicCount} {incr u} {
    recordStart
    varStr "keyword"
    varStr "url"
  }
}

section -collapsed "users" {
  for {set u 1} {$u <= $userCount} {incr u} {
    recordStart
    entityID "id"
    varStr "name"
  }
}

section -collapsed "events" {
  for {set u 1} {$u <= $entryCount} {incr u} {
	  section "event $u" {
      recordStart
      entityID "id"
      timestamp "date"
      varStr "security"
      entityID "audience"
      varStr "subject"
      varStr "body"
      varStr "unknown1"
      varStr "mood"
      entityID "moodId"
      varStr "music"
      bool "isPreformatted"
      bool "noComments"
      varStr "userPic"
      bool "unknown2"
      bool "isBackdated"
      bool "noEmail"
      bool "unknown3"
      entityID "revisions"
      entityID "commentAlter"
      varStr "syndicationUrl"
      varStr "syndicationId"
      timestamp "lastModified"
	  }
	}
}

section -collapsed "comments" {
  for {set u 1} {$u <= $commentCount} {incr u} {
    section -collapsed "comment $u" {
      recordStart
      entityID "id"
      entityID "userID"
      varStr "userName"
      entityID "eventId"
      entityID "parentId"
      varStr "body"
      varStr "subject"
      timestamp "date"
    }
  }
}
