//! Keyword letters order determine columns writting/reading order
const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const order, const cols = getKey(key_str) orelse return false;
    const cols_order = order[0..cols];

    const rows = @divFloor(source.len + cols - 1, cols);

    for (cols_order) |col_i| {
        for (0..rows) |row_i| {
            const idx = row_i * cols + col_i;

            const crypted = if (idx < source.len) source[idx]
                            else opts.padding_cp;

            try sink.print("{u}", .{crypted});
        }
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const order, const rows = getDecrKey(key_str) orelse return false;
    const rows_order = order[0..rows];

    const cols = @divFloor(source.len + rows - 1, rows);

    for (0..cols) |col_i| {
        for (rows_order) |row_i| {
            const idx = row_i * cols + col_i;
            const plain = source[idx];
            if (plain != opts.padding_cp) {
                try sink.print("{u}", .{plain});
            }
        }
    }

    return true;
}

pub const key_max_len = 30;
pub const Key = struct{[key_max_len]usize, usize};

pub fn getKey(key_str: []const u8) ?Key {
    var key_view = std.unicode.Utf8View.init(key_str) catch {
        std.debug.print("Key is not a valid text\n", .{});
        return null;
    };
    var it = key_view.iterator();

    // Convert to unicode
    var keyword: [key_max_len]u21 = undefined;
    var len: usize = 0;
    while (it.nextCodepoint()) |cp| {
        if (len >= key_max_len) {
            std.debug.print("Key length is limited to {}\n", .{key_max_len});
            return null;
        }
        keyword[len] = cp;
        len += 1;
    }

    if (len < 2) {
        std.debug.print("Keyword must be at least 2 characters long", .{});
        return null;
    }

    // Reduce letters alphabetic number to relative alphabetic order
    var key: [key_max_len]usize = undefined;
    for (0..len) |i| {
        const min_i = std.mem.findMin(u21, keyword[0..len]);
        key[min_i] = i;
        keyword[min_i] = std.math.maxInt(u21);
    }

    return .{key, len};
}

pub fn getDecrKey(key_str: []const u8) ?Key {
    const enc_key, const len = getKey(key_str) orelse return null;
    var key: [key_max_len]usize = undefined;

    for (0..len) |i| {
        key[enc_key[i]] = i;
    }

    return .{key, len};
}
