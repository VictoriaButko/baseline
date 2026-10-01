//! Algorithms for frequency analysis
//! Operates on charsets - ordered array of code points
const std = @import("std");
const Io = std.Io;
const util = @import("../util.zig");
const opts = @import("options.zig");


fn inCharset(cp: u21, comptime n: usize, charset: *const [n]u21) ?usize {
    const Ctx = struct {
        fn orderCp(context: u21, item: u21) std.math.Order {
            return std.math.order(context, item);
        }
    };
    return std.sort.binarySearch(u21, charset, cp, Ctx.orderCp);
}

/// Wrapper for countLetters prepearing necessary reader
pub fn countInFile(io: Io,
                   file: Io.File,
                   comptime n: usize,
                   charset: *const [n]u21) struct{usize, [n]usize} {
    var in_buf: [1024]u8 = undefined;
    var source = file.reader(io, &in_buf);
    return countLetters(&source.interface, n, charset);
}

/// Get amount of each letter in file + total number of relevant letters
pub fn countLetters(source: *Io.Reader,
                    comptime n: usize,
                    charset: *const [n]u21) struct{usize, [n]usize} {
    var total: usize = 0;
    var amounts: [n]usize = @splat(0);

    while (true) {
        const cp = util.takeCp(source) catch break orelse break;
        const idx = inCharset(cp, n, charset) orelse continue;
        total += 1;
        amounts[idx] += 1;
    }

    return .{total, amounts};
}

/// Get freqs of letters from its amount and total amount
pub fn countFreqs(comptime n: usize, total: usize, amounts: *const [n]usize) [n]f32 {
    var freqs: [n]f32 = @splat(0);
    for (amounts, 0..) |amount, i| {
        freqs[i] = @floatCast(@as(f128, amount) / @as(f128, total));
    }
    return freqs;
}

fn isPointInRange(p: usize, start: usize, len: usize) bool {
    return p >= start and p < start + len;
}
fn doRangesCollide(r1: usize, n1: usize, r2: usize, n2: usize) bool {
    return isPointInRange(r1, r2, n2) or isPointInRange(r1 + n1, r2, n2) or
        isPointInRange(r2, r1, n1) or isPointInRange(r2 + n2, r1, n1);
}

/// Sum uppercase amounts to lowercase
pub fn toICase(
    comptime orig_n: usize,
    charset: *const [orig_n]u21,
    amounts: *const [orig_n]usize,
    lower: u21, upper: u21,
    comptime in: usize
) struct{[orig_n - in]u21, [orig_n - in]usize} {
    if (doRangesCollide(lower, in, upper, in)) undefined;
    var icharset: [orig_n - in]u21 = undefined;
    var iamounts: [orig_n - in]usize = undefined;

    const lower_i = inCharset(lower, orig_n, charset) orelse undefined;
    const upper_i = inCharset(upper, orig_n, charset) orelse undefined;

    var skiped: usize = 0;
    for (0..charset.len) |i| {
        if (isPointInRange(i, upper_i, in)) {
            skiped += 1;
            continue;
        }
        icharset[i - skiped] = charset[i];
        iamounts[i - skiped] = amounts[i];
        if (isPointInRange(i, lower_i, in)) {
            iamounts[i - skiped] += amounts[i + upper_i - lower_i];
        }
    }
    return .{icharset, iamounts};
}

inline fn indicesArray(comptime n: usize) [n]usize {
    var indices: [n]usize = undefined;
    for (0..n) |i| indices[i] = i;
    return indices;
}

/// Get sorted indices of array
pub fn sortDownIndices(comptime T: type, comptime n: usize,
                       data: *const [n]T) [n]usize {
    var indices = indicesArray(n);

    const ctx: struct {
        data: *const [n]T,
        indices: *[n]usize,
        pub fn lessThan(ctx: *const @This(), a: usize, b: usize) bool {
            return ctx.data[ctx.indices[a]] > ctx.data[ctx.indices[b]];
        }
        pub fn swap(ctx: *const @This(), a: usize, b: usize) void {
            const i = ctx.indices[a];
            ctx.indices[a] = ctx.indices[b];
            ctx.indices[b] = i;
        }
    } = .{.data = data, .indices = &indices};

    std.mem.sortUnstableContext(0, n, ctx);

    return indices;
}

pub const englishUppercase = [_]u21{
    'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X',
    'Y', 'Z',
};
pub const englishLowercase = [_]u21{
    'a', 'b', 'c', 'd',
    'e', 'f', 'g', 'h',
    'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p',
    'q', 'r', 's', 't',
    'u', 'v', 'w', 'x',
    'y', 'z',
};

pub const englishLetters = englishUppercase ++ englishLowercase;

pub const englishFreqs = [_]f32{
    0.08167, 0.01492, 0.02782, 0.04253,
    0.12702, 0.02228, 0.02015, 0.06094,
    0.06966, 0.00153, 0.00772, 0.04025,
    0.02406, 0.06749, 0.07507, 0.01929,
    0.00095, 0.05987, 0.06327, 0.09056,
    0.02758, 0.00978, 0.02360, 0.00150,
    0.01974, 0.00074,
};

/// Find chi^2 for determining how close text frequences to expected frequences of language
pub fn chiSqr(comptime n: usize,
              observed: *const [n]usize,
              expected: *const [n]usize) f64 {
    var chisqr: f64 = 0;
    for (observed, expected) |oi, ei| {
        if (ei == 0) continue;

        const of: f64 = @floatFromInt(oi);
        const ef: f64 = @floatFromInt(ei);
        chisqr += ((of - ef) * (of - ef)) / ef;
    }
    return chisqr;
}

/// Get index of coincedense of letters in text
pub fn coincidenceIndex(io: Io, file: Io.File) f64 {
    var l: [opts.n_chars]u21 = undefined;
    for (opts.min_char..opts.max_char+1, 0..) |cp, i| l[i] = @intCast(cp);

    const total, const a = countInFile(io, file, l.len, &l);
    if (total < 2) return 0;
    _, const ia = toICase(l.len, &l, &a, 'a', 'A', englishLowercase.len);

    var ic: f128 = 0;
    for (ia) |amount_int| {
        const amount: f128 = @floatFromInt(amount_int);
        ic += amount * (amount - 1);
    }
    ic = ic / (total * (total - 1));
    return @floatCast(ic);
}

pub const eng_coinc_index = 0.0667;
pub const ukr_coinc_index = 0.0580;
pub const rnd_coinc_index = 0.0385;
