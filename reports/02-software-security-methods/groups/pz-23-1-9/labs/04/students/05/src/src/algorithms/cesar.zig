const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key: u8 = getKey(key_str) orelse return false;

    for (source) |cp| {
        const crypted: u21 = if (cp >= opts.min_char and cp <= opts.max_char)
            @mod(cp - opts.min_char + key, opts.n_chars) + opts.min_char
        else
            cp;

        try sink.print("{u}", .{crypted});
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const key: u8 = getKey(key_str) orelse return false;

    for (source) |cp| {
        const plain: u21 = if (cp >= opts.min_char and cp <= opts.max_char)
            @intCast(@mod(@as(i32, cp) - opts.min_char - key, opts.n_chars) + opts.min_char)
        else
            cp;

        try sink.print("{u}", .{plain});
    }
    return true;
}

fn getKey(key_str: []const u8) ?u8 {
    const key: u8 = std.fmt.parseInt(u8, key_str, 10) catch {
        std.debug.print("Key needs to be a number\n", .{});
        return null;
    };
    if (key >= opts.n_chars) {
        std.debug.print("Key needs to be a in range [{}; {})\n", .{0, opts.n_chars});
        return null;
    }
    return key;
}
