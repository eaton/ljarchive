# semagic.tcl
# 2024-07-19 | eaton | Initial implementation
# https://semagic.sourceforge.net

# Semagic starts strings with an 0xFFFF marker, followed by a 'length' byte.
# A length value of 0xFF indicates that a two-byte length follows.
# Strings themselves are utf16le encoded.
proc semagic_str {label} {
move 3
  set type [uint8]
  if { $type == 00 } {
  } elseif { $type == 255 } {
    set blen [expr [uint16] * 2]
    str $blen "utf16le" $label
  } else {
    set blen [expr $type * 2]
    str $blen "utf16le" $label
  }
}

requires 0 "FFFF"
move 2
int32

# ascii 10 "Type Code"
move 10
 
for {set u 1} {$u <= 11} {incr u} {
  semagic_str "Unknown"
}

uint32 "ID"
uint32
semagic_str "UserName"
semagic_str "FullName"
semagic_str "Body"
semagic_str "Subject"
uint32
uint32
unixtime32 "Date"
uint32
uint32
uint32
semagic_str "Music"
semagic_str "Mood"
uint32
semagic_str "UserPic"

