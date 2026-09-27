//! Like table_keyword but with second keyword for rows
//! Key format: <rows_key>,<cols_key>
const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");
const tbkw = @import("table_keyword.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(false, key_str, source, sink);
}
pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    return crypt(true, key_str, source, sink);
}

pub fn crypt(to_decrypt: bool, key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key = getKey(key_str, to_decrypt) orelse return false;
    const rows_order = key.row.@"0"[0..key.row.@"1"];
    const cols_order = key.col.@"0"[0..key.col.@"1"];

    const iter_len = rows_order.len * cols_order.len;

    for (0..@divFloor(source.len + iter_len - 1, iter_len)) |i| {
        for (cols_order) |col_i| {
            for (rows_order) |row_i| {
                const idx = i * iter_len + row_i * cols_order.len + col_i;
                if (to_decrypt) {
                    const plain = source[idx];
                    if (plain != opts.padding_cp) {
                        try sink.print("{u}", .{plain});
                    }
                } else {
                    const crypted = if (idx < source.len) source[idx]
                    else opts.padding_cp;
                    try sink.print("{u}", .{crypted});
                }
            }
        }
    }
    return true;
}


const Key = struct{row: tbkw.Key, col: tbkw.Key};

fn getKey(key_str: []const u8, to_decrypt: bool) ?Key {
    const sep_i = std.mem.findScalar(u8, key_str, ',') orelse {
        std.debug.print("Key must be in format '<rows_keyword>;<columns_keyword>'\n", .{});
        return null;
    };
    const row_key, const col_key = if (to_decrypt)
        .{tbkw.getKey(key_str[0..sep_i]),
          tbkw.getKey(key_str[sep_i+1..])}
    else
        .{tbkw.getDecrKey(key_str[sep_i+1..]),
          tbkw.getDecrKey(key_str[0..sep_i])};


    return .{
        .row = row_key orelse return null,
        .col = col_key orelse return null,
    };
}
