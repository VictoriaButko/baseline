//! https://en.wikipedia.org/wiki/Polybius_square
//! Encrypt to coordinates on 5x5 matrix.
//! Removes everything except text at encryption stage
const std = @import("std");
const Io = std.Io;
const opts = @import("options.zig");
const mutil = @import("matrix_cyphers_util.zig");

pub fn encrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    const mat = getKey(key_str) orelse return false;

    for (source) |cp| {
        if (mutil.matrixYX(&mat, cp)) |yx| {
            try sink.print("{d}{d}", .{yx[0], yx[1]});
        } // ignore other symbols
    }
    return true;
}

pub fn decrypt(key_str: []const u8, source: []const u21, sink: *Io.Writer) Io.Writer.Error!bool {
    var src = source;
    while (src[src.len - 1] == '\n' or src[src.len - 1] == ' ') src = src[0..src.len-1];
    if (src.len % 2 != 0) {
        std.debug.print("Text length is not even\n", .{});
        return false;
    }

    const mat = getKey(key_str) orelse return false;

    for (0..src.len/2) |i| {
        const y_ch = src[i*2];
        const x_ch = src[i*2+1];
        if (y_ch < '0' or y_ch > '9' or x_ch < '0' or x_ch > '9') {
            std.debug.print("Text should consist only of digits\n", .{});
            return false;
        }
        const y = y_ch - '0';
        const x = x_ch - '0';
        try sink.print("{u}", .{mat[y*5 + x]});
    }
    return true;
}

pub fn getKey(key_str: []const u8) ?[25]u21 {
    const mat = mutil.makeMatrix(key_str) orelse return null;
    std.debug.print("Matrix:\n", .{});
    mutil.printMatrix(&mat);
    return mat;
}
