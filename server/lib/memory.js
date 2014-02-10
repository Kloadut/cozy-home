// Generated by CoffeeScript 1.6.3
var exec, freeMemCmd, os;

os = require('os');

exec = require('child_process').exec;

freeMemCmd = "free | grep cache: | cut -d':' -f2 | sed -e 's/^ *[0-9]* *//'";

exports.MemoryManager = (function() {
  function MemoryManager() {}

  MemoryManager.prototype._extractDataFromDfResult = function(resp) {
    var data, freeSpace, line, lineData, lines, totalSpace, usedSpace, _i, _len;
    data = {};
    lines = resp.split('\n');
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      line = line.replace(/[\s]+/g, ' ');
      lineData = line.split(' ');
      if (lineData.length > 5 && lineData[5] === '/') {
        freeSpace = lineData[3].substring(0, lineData[3].length - 1);
        totalSpace = lineData[1].substring(0, lineData[1].length - 1);
        usedSpace = lineData[2].substring(0, lineData[2].length - 1);
        data.totalDiskSpace = totalSpace;
        data.freeDiskSpace = freeSpace;
        data.usedDiskSpace = usedSpace;
      }
    }
    return data;
  };

  MemoryManager.prototype.getMemoryInfos = function(callback) {
    var data;
    data = {
      totalMem: os.totalmem() / 1024.
    };
    return exec(freeMemCmd, function(err, resp) {
      var line, lines;
      if (err) {
        return callback(err);
      } else {
        lines = resp.split('\n');
        line = lines[0];
        data.freeMem = line;
        return callback(null, data);
      }
    });
  };

  MemoryManager.prototype.getDiskInfos = function(callback) {
    var _this = this;
    return exec('df -h', function(err, resp) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, _this._extractDataFromDfResult(resp));
      }
    });
  };

  MemoryManager.prototype.isEnoughMemory = function(callback) {
    var _this = this;
    return this.getMemoryInfos(function(err, data) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, data.freeMem > (60 * 1024));
      }
    });
  };

  return MemoryManager;

})();
